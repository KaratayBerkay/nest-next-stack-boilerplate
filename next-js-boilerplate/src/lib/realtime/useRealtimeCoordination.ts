import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { clientEnv } from "@/lib/env";
import { RealtimeClient, type RealtimeStatus } from "./realtime-client";
import {
  openBc,
  leaderSnapshotReply,
  presenceSnapshotFrame,
  waitingFallback,
  type Cmd,
} from "./tab-coordinator";
import { routeToPageClaim } from "./route-mapping";
import { dispatchEvent } from "./event-dispatch";
import { dispatchRenew } from "./renew-dispatch";
import { resyncAfterConnect } from "./resync";

type FrameHandler = (data: Record<string, unknown>) => void;

export function useRealtimeCoordination() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const subsRef = useRef<Map<string, Set<FrameHandler>>>(new Map());
  /**
   * Always-on presence cache, kept current on every online-users/user-online/
   * user-offline frame regardless of whether anything is subscribed to those
   * types right now. The server sends the full online-users snapshot exactly
   * once per WS connection lifecycle (on connect) — which, since this
   * provider is mounted once at the app shell, usually happens long before
   * the Messages page (the only subscriber) ever mounts. Without this cache
   * that snapshot is lost forever and presence only reflects deltas that
   * occur after a subscriber shows up. New subscribers seed from this ref
   * (see getOnlineUsers below) instead of starting from an empty set.
   */
  const onlineUsersRef = useRef<Set<string>>(new Set());
  const clientRef = useRef<RealtimeClient | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const tabIdRef = useRef<string>("");
  tabIdRef.current ||= crypto.randomUUID();
  const claimRef = useRef<{
    page: string | null;
    params?: Record<string, string>;
  } | null>(null);
  const userIdRef = useRef(user?.id);
  const lockResolveRef = useRef<(() => void) | null>(null);
  // Bumped on bfcache restore: pagehide already disconnected the client and
  // released the leader lock, but React state (and this effect) survived the
  // freeze — without a dep change the page would come back with no
  // connection and no queued lock request. Re-running the effect rebuilds
  // both.
  const [wakeTick, setWakeTick] = useState(0);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setWakeTick((t) => t + 1);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    if (!token) return;
    let alive = true;

    const process = (frame: Record<string, unknown>) => {
      if (!alive) return;
      void dispatchRenew(queryClient, frame);
      void dispatchEvent(queryClient, frame, userIdRef.current, (data) => {
        if (clientRef.current) {
          clientRef.current.send(data);
        } else {
          channelRef.current?.postMessage({
            type: "cmd",
            act: "send",
            payload: data,
          } satisfies Cmd);
        }
      });
      const t = frame.type as string;
      if (t === "online-users") {
        const users = (frame.users as { id: string }[] | undefined) ?? [];
        onlineUsersRef.current = new Set(users.map((u) => u.id));
      } else if (t === "user-online") {
        const id = (frame.user as { id: string } | undefined)?.id;
        if (id)
          onlineUsersRef.current = new Set(onlineUsersRef.current).add(id);
      } else if (t === "user-offline") {
        const id = frame.userId as string | undefined;
        if (id) {
          const next = new Set(onlineUsersRef.current);
          next.delete(id);
          onlineUsersRef.current = next;
        }
      }
      const subs = subsRef.current.get(t);
      if (subs) for (const h of subs) h(frame);
    };

    const bc = openBc();
    channelRef.current = bc;

    if (typeof navigator !== "undefined" && navigator.locks) {
      let client: RealtimeClient | null = null;
      let onUnload: (() => void) | null = null;

      const onAuthenticated = () => {
        resyncAfterConnect(queryClient, claimRef.current);
      };

      const onAuthExpired = () => {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      };

      const createLeader = (): RealtimeClient => {
        const c = new RealtimeClient(
          clientEnv.NEXT_PUBLIC_REALTIME_WS_URL,
          (s) => {
            setStatus(s);
            bc?.postMessage({ type: "st", status: s } satisfies Cmd);
          },
          (frame) => {
            process(frame);
            bc?.postMessage({ type: "frame", data: frame } satisfies Cmd);
          },
          onAuthenticated,
          onAuthExpired,
        );
        c.registerServices(["MESSAGE", "NOTIFICATION"]);
        if (claimRef.current) {
          c.claimPage(
            claimRef.current.page,
            claimRef.current.params,
            tabIdRef.current,
          );
        }
        c.connect();
        return c;
      };

      const ac = new AbortController();
      // Defer to avoid cascading-render lint warning; status will be
      // overridden by the RealtimeClient once the lock is acquired, or by
      // the leader's snapshot reply to the "hi" below — waitingFallback
      // keeps this from clobbering either if they land first.
      setTimeout(() => setStatus(waitingFallback), 0);

      navigator.locks
        .request(
          "rt-leader",
          { mode: "exclusive", signal: ac.signal },
          async () => {
            // The lock can still be granted after cleanup already ran (e.g.
            // a logout mid-acquisition) — aborting the signal only cancels a
            // *queued* request, not one the browser already decided to grant.
            // Without this guard, createLeader() below builds a client whose
            // callbacks close over the just-closed `bc`, and its first
            // connect() immediately throws postMessage-on-closed-channel.
            if (!alive) return;
            client = createLeader();
            clientRef.current = client;

            await new Promise<void>((resolve) => {
              lockResolveRef.current = resolve;
              onUnload = () => {
                client?.disconnect();
                resolve();
                lockResolveRef.current = null;
              };
              // pagehide, NOT beforeunload: beforeunload also fires for
              // navigations/closes the user then CANCELS — tearing down the
              // client and releasing the leader lock there left a live page
              // with no connection and no queued lock request (dead until
              // reload). pagehide only fires once the page is actually
              // being hidden for unload/bfcache.
              window.addEventListener("pagehide", onUnload);
            });
          },
        )
        .then(() => {
          if (!alive) return;
          alive = false;
          client?.disconnect();
          clientRef.current = null;
        })
        .catch(() => {
          if (!alive) return;
          clientRef.current = null;
        });

      if (bc) {
        const onMsg = (e: MessageEvent<Cmd>) => {
          const m = e.data;
          switch (m.type) {
            case "frame":
              process(m.data);
              break;
            case "st":
              setStatus(m.status);
              break;
            case "hi":
              // Only the leader answers — it's the one tab with a live
              // client whose status/presence mean anything.
              if (client) {
                for (const reply of leaderSnapshotReply(
                  client.getStatus(),
                  onlineUsersRef.current,
                )) {
                  bc.postMessage(reply);
                }
              }
              break;
            case "presence":
              // Through process(), not just the ref — see
              // presenceSnapshotFrame's contract note.
              process(presenceSnapshotFrame(m.users));
              break;
            case "cmd":
              if (client) {
                if (m.act === "send")
                  client.send(m.payload as Record<string, unknown>);
                else if (m.act === "watch") client.watch(m.payload as string);
                else if (m.act === "unwatch")
                  client.unwatch(m.payload as string);
                else if (m.act === "register")
                  client.registerServices(m.payload as string[]);
                else if (m.act === "claim") {
                  const p = m.payload as {
                    page: string | null;
                    params?: Record<string, string>;
                    tabId?: string;
                  };
                  client.claimPage(p.page, p.params, p.tabId);
                } else if (m.act === "unclaim") {
                  client.unclaimPage(m.payload as string);
                }
              }
              break;
          }
        };
        bc.addEventListener("message", onMsg);
        // Ask an already-running leader for its current status + presence.
        // Status is otherwise only broadcast on CHANGES, so a tab joining
        // while the leader sits stably "open" would report "waiting"
        // forever (disabled chat input, "Call unavailable" on every call
        // attempt) — the stuck-second-tab incident of 2026-08-28. Harmless
        // when no leader exists yet: whoever wins the lock broadcasts its
        // connect transitions anyway.
        bc.postMessage({ type: "hi" } satisfies Cmd);

        return () => {
          alive = false;
          bc.removeEventListener("message", onMsg);
          if (client) {
            client.unclaimPage(tabIdRef.current);
            client.disconnect();
          }
          clientRef.current = null;
          bc.close();
          channelRef.current = null;
          if (onUnload) {
            window.removeEventListener("pagehide", onUnload);
            onUnload = null;
          }
          if (lockResolveRef.current) {
            lockResolveRef.current();
            lockResolveRef.current = null;
          }
          ac.abort();
        };
      }

      return () => {
        alive = false;
        if (client) {
          client.unclaimPage(tabIdRef.current);
          client.disconnect();
        }
        clientRef.current = null;
        if (onUnload) {
          window.removeEventListener("pagehide", onUnload);
          onUnload = null;
        }
        if (lockResolveRef.current) {
          lockResolveRef.current();
          lockResolveRef.current = null;
        }
        ac.abort();
      };
    }

    const client = new RealtimeClient(
      clientEnv.NEXT_PUBLIC_REALTIME_WS_URL,
      setStatus,
      process,
      () => {
        resyncAfterConnect(queryClient, claimRef.current);
      },
      () => {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      },
    );
    client.registerServices(["MESSAGE", "NOTIFICATION"]);
    if (claimRef.current?.page) {
      client.claimPage(
        claimRef.current.page,
        claimRef.current.params,
        tabIdRef.current,
      );
    }
    clientRef.current = client;
    client.connect();

    return () => {
      alive = false;
      client.unclaimPage(tabIdRef.current);
      client.disconnect();
      clientRef.current = null;
    };
  }, [token, queryClient, wakeTick]);

  useEffect(() => {
    if (!token) return;
    const claim = routeToPageClaim(pathname, searchParams);
    claimRef.current = claim;

    if (clientRef.current) {
      clientRef.current.claimPage(claim.page, claim.params, tabIdRef.current);
    } else {
      channelRef.current?.postMessage({
        type: "cmd",
        act: "claim",
        payload: { ...claim, tabId: tabIdRef.current },
      } satisfies Cmd);
    }
  }, [pathname, searchParams, token]);

  const prevStatusRef = useRef<RealtimeStatus | null>(null);
  useEffect(() => {
    if (prevStatusRef.current !== "open" && status === "open") {
      queryClient.invalidateQueries({ queryKey: ["notifications", "count"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "dm-count"],
      });
    }
    prevStatusRef.current = status;
  }, [status, queryClient]);

  const send = useCallback((data: Record<string, unknown>) => {
    if (clientRef.current) {
      clientRef.current.send(data);
    } else if (channelRef.current) {
      channelRef.current.postMessage({
        type: "cmd",
        act: "send",
        payload: data,
      } satisfies Cmd);
    }
  }, []);

  const subscribe = useCallback(
    (type: string, handler: FrameHandler): (() => void) => {
      if (!subsRef.current.has(type)) subsRef.current.set(type, new Set());
      subsRef.current.get(type)!.add(handler);
      return () => {
        const s = subsRef.current.get(type);
        if (s) {
          s.delete(handler);
          if (s.size === 0) subsRef.current.delete(type);
        }
      };
    },
    [],
  );

  const getOnlineUsers = useCallback(
    (): Set<string> => onlineUsersRef.current,
    [],
  );

  const watch = useCallback((topic: string) => {
    if (clientRef.current) {
      clientRef.current.watch(topic);
    } else {
      channelRef.current?.postMessage({
        type: "cmd",
        act: "watch",
        payload: topic,
      } satisfies Cmd);
    }
  }, []);

  const unwatch = useCallback((topic: string) => {
    if (clientRef.current) {
      clientRef.current.unwatch(topic);
    } else {
      channelRef.current?.postMessage({
        type: "cmd",
        act: "unwatch",
        payload: topic,
      } satisfies Cmd);
    }
  }, []);

  const registerServices = useCallback((services: string[]) => {
    if (clientRef.current) {
      clientRef.current.registerServices(services);
    } else {
      channelRef.current?.postMessage({
        type: "cmd",
        act: "register",
        payload: services,
      } satisfies Cmd);
    }
  }, []);

  const claimPage = useCallback(
    (page: string | null, params?: Record<string, string>) => {
      claimRef.current = { page, params };
      const tabId = tabIdRef.current;
      if (clientRef.current) {
        clientRef.current.claimPage(page, params, tabId);
      } else {
        channelRef.current?.postMessage({
          type: "cmd",
          act: "claim",
          payload: { page, params, tabId },
        } satisfies Cmd);
      }
    },
    [],
  );

  return {
    status,
    send,
    subscribe,
    getOnlineUsers,
    watch,
    unwatch,
    registerServices,
    claimPage,
  };
}
