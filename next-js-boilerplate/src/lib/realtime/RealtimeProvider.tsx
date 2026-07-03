"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

// ── Tab coordination ──

const TAB_ID =
  typeof crypto !== "undefined"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const CHANNEL = "rt-coord";
const ELECTION_MS = 1_200;
// Browser throttles setInterval in background tabs to ~60s, so heartbeat at 30s
// and give followers a 3x cushion (90s) before re-electing.
const HEARTBEAT_MS = 30_000;
const LEADER_TIMEOUT_MS = 90_000;

type Cmd =
  | { type: "hello"; tabId: string }
  | { type: "gone"; tabId: string }
  | { type: "leader"; tabId: string }
  | { type: "beat"; tabId: string }
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

// ── Renew-frame dispatch ──

function dispatchRenew(
  qc: ReturnType<typeof useQueryClient>,
  frame: Record<string, unknown>,
): void {
  if (!frame.renew) return;
  switch (frame.renew as string) {
    case "Notifications": {
      if (frame.type === "Count") {
        qc.setQueryData(["notifications", "count"], frame.value);
      } else if (frame.type === "Item") {
        qc.setQueryData(
          ["notifications", "list"],
          (old: unknown[] | undefined) => {
            const list = (old ?? []) as Record<string, unknown>[];
            const item = frame.item as Record<string, unknown>;
            if (list.some((n) => n.id === item.id)) return list;
            return [item, ...list];
          },
        );
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
              updated[idx] = { ...(updated[idx] as object), ...conv };
              return updated.sort(
                (a, b) =>
                  new Date((b.lastTime as string) ?? "").getTime() -
                  new Date((a.lastTime as string) ?? "").getTime(),
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
      }
      break;
    }
  }
}

// ── Provider ──

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const subsRef = useRef<Map<string, Set<FrameHandler>>>(new Map());
  const clientRef = useRef<RealtimeClient | null>(null);
  const leaderRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // ── Single effect: owns all coordination state ──

  useEffect(() => {
    if (!token) return;
    let alive = true;

    // Process an incoming frame (from WS or broadcast)
    const process = (frame: Record<string, unknown>) => {
      dispatchRenew(queryClient, frame);
      const t = frame.type as string;
      const subs = subsRef.current.get(t);
      if (subs) for (const h of subs) h(frame);
    };

    // ── Standalone WS (no BroadcastChannel) ──

    const startStandalone = () => {
      const client = new RealtimeClient(
        clientEnv.NEXT_PUBLIC_REALTIME_WS_URL,
        () => {
          if (!alive) return Promise.resolve(null);
          return cachedFetchTokens(token);
        },
        setStatus,
        process,
      );
      clientRef.current = client;
      client.connect();
      client.registerServices(["MESSAGE", "NOTIFICATION"]);
    };

    const bc = openBc();
    if (!bc) {
      startStandalone();
      return () => {
        alive = false;
        clientRef.current?.disconnect();
        clientRef.current = null;
      };
    }

    channelRef.current = bc;

    // ── Leader election ──

    let knownTabs = new Set<string>([TAB_ID]);
    let electionTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let leaderTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
    let isLeader = false;
    let visHandler: (() => void) | null = null;

    const scheduleReelect = () => {
      if (leaderTimeoutTimer) clearTimeout(leaderTimeoutTimer);
      leaderTimeoutTimer = setTimeout(elect, LEADER_TIMEOUT_MS);
    };

    const elect = () => {
      if (!alive) return;
      isLeader = false;
      leaderRef.current = false;
      knownTabs = new Set([TAB_ID]);
      bc.postMessage({ type: "hello", tabId: TAB_ID } satisfies Cmd);
      if (electionTimer) clearTimeout(electionTimer);
      electionTimer = setTimeout(() => {
        if (!alive) return;
        const sorted = Array.from(knownTabs).sort();
        if (sorted[0] === TAB_ID) {
          // Become leader
          isLeader = true;
          leaderRef.current = true;
          bc.postMessage({ type: "leader", tabId: TAB_ID } satisfies Cmd);
          clientRef.current?.disconnect();
          const client = new RealtimeClient(
            clientEnv.NEXT_PUBLIC_REALTIME_WS_URL,
            () => {
              if (!alive) return Promise.resolve(null);
              return cachedFetchTokens(token);
            },
            (s) => {
              setStatus(s);
              bc.postMessage({ type: "st", status: s } satisfies Cmd);
              if (s === "down" && isLeader) {
                isLeader = false;
                leaderRef.current = false;
                bc.postMessage({ type: "gone", tabId: TAB_ID } satisfies Cmd);
              }
            },
            (frame) => {
              process(frame);
              bc.postMessage({ type: "frame", data: frame } satisfies Cmd);
            },
          );
          clientRef.current = client;
          client.connect();
          client.registerServices(["MESSAGE", "NOTIFICATION"]);
          let visible = true;
          visHandler = () => {
            visible = !document.hidden;
          };
          document.addEventListener("visibilitychange", visHandler);
          heartbeatTimer = setInterval(() => {
            if (alive && visible)
              bc.postMessage({ type: "beat", tabId: TAB_ID } satisfies Cmd);
          }, HEARTBEAT_MS);
        } else {
          // Become follower
          isLeader = false;
          leaderRef.current = false;
          clientRef.current?.disconnect();
          clientRef.current = null;
          setStatus("open");
          scheduleReelect();
        }
      }, ELECTION_MS);
    };

    // ── BroadcastChannel message handler ──

    const onMsg = (e: MessageEvent<Cmd>) => {
      const m = e.data;
      switch (m.type) {
        case "hello":
          knownTabs.add(m.tabId);
          break;
        case "gone":
          knownTabs.delete(m.tabId);
          if (!isLeader && m.tabId !== TAB_ID) {
            // If we're following the departed leader, re-elect
            // (any follower can detect this)
            elect();
          }
          break;
        case "leader":
          if (m.tabId !== TAB_ID && !isLeader) {
            isLeader = false;
            leaderRef.current = false;
            clientRef.current?.disconnect();
            clientRef.current = null;
            setStatus("open");
            scheduleReelect();
          }
          break;
        case "beat":
          scheduleReelect();
          break;
        case "frame":
          if (!isLeader) process(m.data);
          break;
        case "st":
          if (!isLeader) setStatus(m.status);
          break;
        case "cmd":
          if (isLeader) {
            if (m.act === "send")
              clientRef.current?.send(m.payload as Record<string, unknown>);
            else if (m.act === "watch")
              clientRef.current?.watch(m.payload as string);
            else if (m.act === "unwatch")
              clientRef.current?.unwatch(m.payload as string);
            else if (m.act === "register")
              clientRef.current?.registerServices(m.payload as string[]);
          }
          break;
      }
    };

    bc.addEventListener("message", onMsg);
    elect();

    const onUnload = () => {
      bc.postMessage({ type: "gone", tabId: TAB_ID } satisfies Cmd);
      if (isLeader) {
        clientRef.current?.disconnect();
        clientRef.current = null;
      }
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      alive = false;
      window.removeEventListener("beforeunload", onUnload);
      bc.removeEventListener("message", onMsg);
      bc.postMessage({ type: "gone", tabId: TAB_ID } satisfies Cmd);
      if (electionTimer) clearTimeout(electionTimer);
      if (visHandler) document.removeEventListener("visibilitychange", visHandler);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (leaderTimeoutTimer) clearTimeout(leaderTimeoutTimer);
      if (isLeader) {
        clientRef.current?.disconnect();
        clientRef.current = null;
      }
      bc.close();
      channelRef.current = null;
    };
  }, [token, queryClient]);

  // ── Public API ──

  const send = useCallback((data: Record<string, unknown>) => {
    if (leaderRef.current) {
      clientRef.current?.send(data);
    } else {
      channelRef.current?.postMessage({
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
        subsRef.current.get(type)?.delete(handler);
      };
    },
    [],
  );

  const watch = useCallback((topic: string) => {
    if (leaderRef.current) {
      clientRef.current?.watch(topic);
    } else {
      channelRef.current?.postMessage({
        type: "cmd",
        act: "watch",
        payload: topic,
      } satisfies Cmd);
    }
  }, []);

  const unwatch = useCallback((topic: string) => {
    if (leaderRef.current) {
      clientRef.current?.unwatch(topic);
    } else {
      channelRef.current?.postMessage({
        type: "cmd",
        act: "unwatch",
        payload: topic,
      } satisfies Cmd);
    }
  }, []);

  const registerServices = useCallback((services: string[]) => {
    if (leaderRef.current) {
      clientRef.current?.registerServices(services);
    } else {
      channelRef.current?.postMessage({
        type: "cmd",
        act: "register",
        payload: services,
      } satisfies Cmd);
    }
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        status,
        send,
        subscribe,
        watch,
        unwatch,
        registerServices,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error("useRealtime must be used within RealtimeProvider");
  return ctx;
}

export function useRealtimeStatus(): RealtimeStatus {
  return useRealtime().status;
}
