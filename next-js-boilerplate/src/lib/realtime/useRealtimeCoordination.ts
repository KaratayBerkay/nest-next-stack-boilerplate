import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { clientEnv } from "@/lib/env";
import { RealtimeClient, type RealtimeStatus } from "./realtime-client";
import { cachedFetchTokens, bustTokenCache } from "./token-cache";
import { openBc, type Cmd } from "./tab-coordinator";
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

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    if (!token) return;
    let alive = true;

    const process = (frame: Record<string, unknown>) => {
      if (!alive) return;
      dispatchRenew(queryClient, frame);
      dispatchEvent(queryClient, frame, userIdRef.current, (data) => {
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
      const subs = subsRef.current.get(t);
      if (subs) for (const h of subs) h(frame);
    };

    const bc = openBc();
    channelRef.current = bc;

    if (typeof navigator !== "undefined" && navigator.locks) {
      let client: RealtimeClient | null = null;

      const onAuthenticated = () => {
        resyncAfterConnect(queryClient, claimRef.current);
      };

      const createLeader = (): RealtimeClient => {
        const c = new RealtimeClient(
          clientEnv.NEXT_PUBLIC_REALTIME_WS_URL,
          () => {
            if (!alive) return Promise.resolve(null);
            return cachedFetchTokens(token);
          },
          (s) => {
            setStatus(s);
            bc?.postMessage({ type: "st", status: s } satisfies Cmd);
          },
          (frame) => {
            process(frame);
            bc?.postMessage({ type: "frame", data: frame } satisfies Cmd);
          },
          onAuthenticated,
          bustTokenCache,
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

      navigator.locks
        .request(
          "rt-leader",
          { mode: "exclusive", signal: ac.signal },
          async () => {
            client = createLeader();
            clientRef.current = client;

            await new Promise<void>((resolve) => {
              lockResolveRef.current = resolve;
              const onUnload = () => {
                client?.disconnect();
                resolve();
                lockResolveRef.current = null;
              };
              window.addEventListener("beforeunload", onUnload);
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
        if (lockResolveRef.current) {
          lockResolveRef.current();
          lockResolveRef.current = null;
        }
        ac.abort();
      };
    }

    const client = new RealtimeClient(
      clientEnv.NEXT_PUBLIC_REALTIME_WS_URL,
      () => {
        if (!alive) return Promise.resolve(null);
        return cachedFetchTokens(token);
      },
      setStatus,
      process,
      () => {
        resyncAfterConnect(queryClient, claimRef.current);
      },
      bustTokenCache,
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
  }, [token, queryClient]);

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
    watch,
    unwatch,
    registerServices,
    claimPage,
  };
}
