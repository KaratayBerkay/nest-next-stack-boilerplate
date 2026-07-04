"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { clientEnv } from "@/lib/env";
import { apiFetch } from "@/lib/api-client";
import {
  RealtimeClient,
  type RealtimeStatus,
} from "./realtime-client";

export type FrameHandler = (data: Record<string, unknown>) => void;

type RealtimeContextValue = {
  status: RealtimeStatus;
  send: (data: Record<string, unknown>) => void;
  subscribe: (type: string, handler: FrameHandler) => () => void;
  watch: (topic: string) => void;
  unwatch: (topic: string) => void;
  registerServices: (services: string[]) => void;
  claimPage: (page: string | null, params?: Record<string, string>) => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

// ── Module-level helpers ──

async function fetchTokens(
  token: string,
): Promise<Record<string, string> | null> {
  try {
    const res = await apiFetch("/api/auth/token");
    if (!res.ok) return null;
    const json = await res.json();
    return {
      accessToken: json.accessToken ?? token,
      rbacToken: json.rbacToken ?? "",
      deviceToken: json.deviceToken ?? "",
      userToken: json.userToken ?? "",
    };
  } catch {
    return null;
  }
}

// Token cache: 30s TTL + in-flight promise dedup
let _tokKey = "";
let _tokData: Record<string, string> | null = null;
let _tokExp = 0;
let _tokPromise: Promise<Record<string, string> | null> | null = null;

function cachedFetchTokens(
  token: string,
): Promise<Record<string, string> | null> {
  const key = `t:${token}`;
  if (_tokKey === key && Date.now() < _tokExp && _tokData) {
    return Promise.resolve(_tokData);
  }
  // Dedup concurrent calls (e.g. leader re-election)
  if (_tokKey === key && _tokPromise) return _tokPromise;
  _tokKey = key;
  _tokPromise = fetchTokens(token);
  return _tokPromise.then((d) => {
    _tokPromise = null;
    if (d) {
      _tokData = d;
      _tokExp = Date.now() + 30_000;
    }
    return d;
  });
}

/** Bust the token cache so the next fetch gets fresh tokens. */
function bustTokenCache(): void {
  _tokKey = "";
  _tokData = null;
  _tokExp = 0;
  _tokPromise = null;
}

// ── Tab coordination (BroadcastChannel for fan-out + cmd forwarding) ──

const CHANNEL = "rt-coord";

type Cmd =
  | { type: "frame"; data: Record<string, unknown> }
  | { type: "st"; status: RealtimeStatus }
  | { type: "cmd"; act: string; payload: unknown };

function openBc(): BroadcastChannel | null {
  try {
    return new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
}

// ── Route → page claim mapping ──

function routeToPageClaim(
  pathname: string | null,
  searchParams: URLSearchParams | null,
): { page: string | null; params?: Record<string, string> } {
  if (!pathname) return { page: null };
  const sp = searchParams ?? new URLSearchParams();
  const seg = pathname.split("/").filter(Boolean);
  // Everything after /v1/{lang}/ is the route path
  const route = seg.slice(2).join("/");

  if (route === "messages" || route.startsWith("messages")) {
    const user = sp.get("user");
    if (user) return { page: "messages", params: { peer: user } };
    return { page: "messages" };
  }
  if (route === "find-friends") {
    return { page: "friend-request" };
  }
  if (route === "notification") {
    return { page: "notification" };
  }
  if (route === "feed") {
    return { page: "feed" };
  }
  if (route.startsWith("posts/")) {
    const uuid = route.split("/")[1];
    if (uuid) return { page: "post", params: { id: uuid } };
    return { page: "feed" };
  }
  if (route === "chat-room") {
    const room = sp.get("room") || "general";
    return { page: "chat-room", params: { room } };
  }
  return { page: null };
}

// ── Event-frame dispatch (D4: cache writes for pushed events) ──

function dispatchEvent(
  qc: ReturnType<typeof useQueryClient>,
  frame: Record<string, unknown>,
  ownUserId?: string,
  sendFrame?: (data: Record<string, unknown>) => void,
): void {
  const t = frame.type as string;

  if (t === "direct-message" && ownUserId) {
    const msg = frame.message as Record<string, unknown> & {
      id: string;
      senderId: string;
      recipientId: string;
    };
    if (!msg?.id) return;
    const peerId =
      msg.senderId === ownUserId ? msg.recipientId : msg.senderId;
    if (!qc.getQueryData(["messages", peerId])) return;
    qc.setQueryData(["messages", peerId], (old: unknown) => {
      const data = old as
        | { pages: { messages: Record<string, unknown>[] }[] }
        | undefined;
      if (!data?.pages?.length) return old;
      const pages = [...data.pages];
      const first = { ...pages[0] };
      if (first.messages.some((m) => m.id === msg.id)) return old;
      first.messages = [...first.messages, msg];
      pages[0] = first;
      return { ...data, pages };
    });
    // Auto-ack delivery for incoming DMs (T4)
    if (msg.recipientId === ownUserId && sendFrame) {
      sendFrame({ type: "delivered-ack", messageId: msg.id });
    }
  }

  if (t === "message-read" && ownUserId) {
    const peerId = (frame.peerId as string) ?? "";
    if (!qc.getQueryData(["messages", peerId])) return;
    qc.setQueryData(["messages", peerId], (old: unknown) => {
      const data = old as
        | { pages: { messages: Record<string, unknown>[] }[] }
        | undefined;
      if (!data?.pages?.length) return old;
      const pages = data.pages.map((page) => ({
        ...page,
        messages: page.messages.map((m) =>
          m.senderId === ownUserId && !m.readAt
            ? { ...m, readAt: frame.readAt }
            : m,
        ),
      }));
      return { ...data, pages };
    });
  }

  if (t === "message-delivered" && ownUserId) {
    const peerId = (frame.peerId as string) ?? "";
    if (!qc.getQueryData(["messages", peerId])) return;
    qc.setQueryData(["messages", peerId], (old: unknown) => {
      const data = old as
        | { pages: { messages: Record<string, unknown>[] }[] }
        | undefined;
      if (!data?.pages?.length) return old;
      const pages = data.pages.map((page) => ({
        ...page,
        messages: page.messages.map((m) =>
          m.id === frame.messageId
            ? { ...m, deliveredAt: frame.deliveredAt }
            : m,
        ),
      }));
      return { ...data, pages };
    });
  }

  if (t === "room-message") {
    const room = frame.room as string;
    const msg = frame.message as Record<string, unknown>;
    if (!room || !msg) return;
    const existing = qc.getQueryData(["room", room]);
    if (!existing) return;
    qc.setQueryData(
      ["room", room],
      (old: Record<string, unknown>[] | undefined) => {
        const msgs = old ?? [];
        if (msgs.some((m) => m.id === msg.id)) return old;
        return [...msgs, msg];
      },
    );
  }
}

// ── Renew-frame dispatch ──

function dispatchRenew(
  qc: ReturnType<typeof useQueryClient>,
  frame: Record<string, unknown>,
): void {
  if (!frame.renew) return;
  switch (frame.renew as string) {
    case "Notifications": {
      if (frame.type === "Count") {
        if (qc.getQueryData(["notifications", "count"]) !== undefined)
          qc.setQueryData(["notifications", "count"], frame.value);
      } else if (frame.type === "DmCount") {
        if (qc.getQueryData(["notifications", "dm-count"]) !== undefined)
          qc.setQueryData(["notifications", "dm-count"], frame.value);
      } else if (frame.type === "Item") {
        if (!qc.getQueryData(["notifications", "list"])) {
          qc.invalidateQueries({ queryKey: ["notifications", "list"] });
        } else {
          qc.setQueryData(
            ["notifications", "list"],
            (old: { items: Record<string, unknown>[] } | undefined) => {
              const list = (old?.items ?? []) as Record<string, unknown>[];
              const item = frame.item as Record<string, unknown>;
              if (list.some((n) => n.id === item.id)) return old;
              return { ...old, items: [item, ...list] };
            },
          );
        }
      } else if (frame.type === "Read") {
        qc.invalidateQueries({ queryKey: ["notifications"] });
      }
      break;
    }
    case "Messages": {
      if (frame.type === "Conversation") {
        qc.setQueryData(
          ["conversations"],
          (old: unknown[] | undefined) => {
            const list = (old ?? []) as Record<string, unknown>[];
            const conv = frame.conversation as Record<string, unknown> & {
              user: { id: string };
            };
            const idx = list.findIndex(
              (c) => (c.user as Record<string, unknown>)?.id === conv.user.id,
            );
            if (idx >= 0) {
              const updated = [...list];
              // Merge only non-empty fields (T5)
              const merged: Record<string, unknown> = {
                ...(updated[idx] as Record<string, unknown>),
              };
              for (const [k, v] of Object.entries(conv)) {
                if (v !== undefined && v !== null && v !== "") {
                  merged[k] = v;
                }
              }
              updated[idx] = merged;
              return updated.sort(
                (a, b) =>
                  (new Date((b.lastTime as string) ?? "").getTime() || 0) -
                  (new Date((a.lastTime as string) ?? "").getTime() || 0),
              );
            }
            return [conv, ...list];
          },
        );
      }
      break;
    }
    case "Feed": {
      if (frame.type === "New") {
        qc.setQueryData(["feed", "new-flag"], true);
      } else if (frame.type === "Post" && frame.id) {
        qc.invalidateQueries({
          queryKey: ["posts", frame.id as string],
          refetchType: "active",
        });
        qc.invalidateQueries({
          queryKey: ["feed", "list"],
          refetchType: "active",
        });
      }
      break;
    }
    case "Friends": {
      if (frame.type === "PendingList") {
        qc.invalidateQueries({ queryKey: ["friends", "requests"] });
        qc.invalidateQueries({ queryKey: ["friends", "list"] });
      }
      break;
    }
  }
}

// ── Resync on (re)connect (B11) ──

function resyncAfterConnect(
  qc: ReturnType<typeof useQueryClient>,
  currentClaim: { page: string | null; params?: Record<string, string> } | null,
): void {
  // Chrome keys — always invalidate
  qc.invalidateQueries({ queryKey: ["conversations"] });
  qc.invalidateQueries({ queryKey: ["notifications", "list"] });
  qc.invalidateQueries({ queryKey: ["notifications", "count"] });
  qc.invalidateQueries({ queryKey: ["notifications", "dm-count"] });

  // Current page content key
  if (currentClaim?.page === "feed") {
    qc.invalidateQueries({ queryKey: ["feed"] });
  } else if (currentClaim?.page === "post" && currentClaim.params?.id) {
    qc.invalidateQueries({ queryKey: ["posts", currentClaim.params.id] });
  } else if (currentClaim?.page === "messages" && currentClaim.params?.peer) {
    qc.invalidateQueries({
      queryKey: ["messages", currentClaim.params.peer],
    });
  } else if (currentClaim?.page === "chat-room" && currentClaim.params?.room) {
    qc.invalidateQueries({
      queryKey: ["room", currentClaim.params.room],
    });
  }
}

// ── Provider (inner — must be inside <Suspense> for useSearchParams) ──

function RealtimeProviderInner({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const subsRef = useRef<Map<string, Set<FrameHandler>>>(new Map());
  const clientRef = useRef<RealtimeClient | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const claimRef = useRef<{ page: string | null; params?: Record<string, string> } | null>(null);
  const userIdRef = useRef(user?.id);
  const lockResolveRef = useRef<(() => void) | null>(null);

  // T18(H5): ref write in effect, not render phase
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  // ── Single effect: owns all coordination state ──

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
      // Auto mark as read when a DM arrives for an active conversation.
      if (
        frame.type === "direct-message" &&
        userIdRef.current
      ) {
        const msg = frame.message as Record<string, unknown> & {
          senderId: string;
          recipientId: string;
        };
        if (
          msg?.recipientId === userIdRef.current &&
          msg?.senderId &&
          queryClient.getQueryData(["messages", msg.senderId])
        ) {
          queryClient.setQueryData(["conversations"], (old: unknown) => {
            const list = (old ?? []) as Record<string, unknown>[];
            return list.map((c) => {
              const user = c.user as Record<string, unknown> | undefined;
              if (user?.id === msg.senderId) {
                return { ...c, unread: 0 };
              }
              return c;
            });
          });
          apiFetch("/api/messages/read", {
            method: "POST",
            body: JSON.stringify({ userId: msg.senderId }),
          }).catch(() => {});
        }
      }
      const t = frame.type as string;
      const subs = subsRef.current.get(t);
      if (subs) for (const h of subs) h(frame);
    };

    const bc = openBc();
    channelRef.current = bc;

    if (typeof navigator !== "undefined" && navigator.locks) {
      let client: RealtimeClient | null = null;

      const onAuthenticated = () => {
        // replayClaim in realtime-client already re-sends the page claim.
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
          c.claimPage(claimRef.current.page, claimRef.current.params);
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
                else if (m.act === "watch")
                  client.watch(m.payload as string);
                else if (m.act === "unwatch")
                  client.unwatch(m.payload as string);
                else if (m.act === "register")
                  client.registerServices(m.payload as string[]);
                else if (m.act === "claim") {
                  const p = m.payload as {
                    page: string | null;
                    params?: Record<string, string>;
                  };
                  client.claimPage(p.page, p.params);
                }
              }
              break;
          }
        };
        bc.addEventListener("message", onMsg);

        return () => {
          alive = false;
          bc.removeEventListener("message", onMsg);
          client?.disconnect();
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
        client?.disconnect();
        clientRef.current = null;
        if (lockResolveRef.current) {
          lockResolveRef.current();
          lockResolveRef.current = null;
        }
        ac.abort();
      };
    }

    // ── Fallback: standalone socket per tab (no BroadcastChannel) ──

    const client = new RealtimeClient(
      clientEnv.NEXT_PUBLIC_REALTIME_WS_URL,
      () => {
        if (!alive) return Promise.resolve(null);
        return cachedFetchTokens(token);
      },
      setStatus,
      process,
      () => {
        // replayClaim in realtime-client already re-sends the page claim.
        resyncAfterConnect(queryClient, claimRef.current);
      },
      bustTokenCache,
    );
    client.registerServices(["MESSAGE", "NOTIFICATION"]);
    if (claimRef.current?.page) {
      client.claimPage(claimRef.current.page, claimRef.current.params);
    }
    clientRef.current = client;
    client.connect();

    return () => {
      alive = false;
      client.disconnect();
      clientRef.current = null;
    };
  }, [token, queryClient]);

  // ── Route-change claim sending ──

  useEffect(() => {
    if (!token) return;
    const claim = routeToPageClaim(pathname, searchParams);
    claimRef.current = claim;
    if (!claim.page) return;

    if (clientRef.current) {
      clientRef.current.claimPage(claim.page, claim.params);
    } else {
      // Follower: forward claim to leader via BroadcastChannel
      channelRef.current?.postMessage({
        type: "cmd",
        act: "claim",
        payload: claim,
      } satisfies Cmd);
    }
  }, [pathname, searchParams, token]);

  // ── Public API ──

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
      if (!subsRef.current.has(type))
        subsRef.current.set(type, new Set());
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
      if (clientRef.current) {
        clientRef.current.claimPage(page, params);
      } else {
        channelRef.current?.postMessage({
          type: "cmd",
          act: "claim",
          payload: { page, params },
        } satisfies Cmd);
      }
    },
    [],
  );

  return (
    <RealtimeContext.Provider
      value={{
        status,
        send,
        subscribe,
        watch,
        unwatch,
        registerServices,
        claimPage,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

// ── Provider (outer — wraps inner in Suspense for useSearchParams) ──

export function RealtimeProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RealtimeProviderInner>{children}</RealtimeProviderInner>
    </Suspense>
  );
}

export function useRealtime(): RealtimeContextValue | null {
  return useContext(RealtimeContext);
}

export function useRealtimeStatus(): RealtimeStatus | null {
  return useRealtime()?.status ?? null;
}
