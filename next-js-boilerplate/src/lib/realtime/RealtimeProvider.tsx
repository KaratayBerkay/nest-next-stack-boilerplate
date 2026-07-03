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

function dispatchRenewFrame(
  queryClient: ReturnType<typeof useQueryClient>,
  frame: Record<string, unknown>,
): void {
  if (!frame.renew) return;

  switch (frame.renew as string) {
    case "Notifications": {
      if (frame.type === "Count") {
        queryClient.setQueryData(["notifications", "count"], frame.value);
      } else if (frame.type === "Item") {
        queryClient.setQueryData(
          ["notifications", "list"],
          (old: unknown[] | undefined) => {
            const list = (old ?? []) as Record<string, unknown>[];
            const item = frame.item as Record<string, unknown>;
            if (list.some((n) => n.id === item.id))
              return list;
            return [item, ...list];
          },
        );
      }
      break;
    }
    case "Messages": {
      if (frame.type === "Conversation") {
        queryClient.setQueryData(
          ["conversations"],
          (old: unknown[] | undefined) => {
            const list = (old ?? []) as Record<string, unknown>[];
            const conv = frame.conversation as Record<string, unknown> & {
              user: { id: string };
            };
            const idx = list.findIndex(
              (c) =>
                (c.user as Record<string, unknown>)?.id === conv.user.id,
            );
            if (idx >= 0) {
              const updated = [...list];
              updated[idx] = { ...updated[idx], ...conv };
              return updated.sort(
                (a, b) =>
                  new Date(
                    (b.lastTime as string) ?? "",
                  ).getTime() -
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
        queryClient.setQueryData(["feed", "new-flag"], true);
      } else if (frame.type === "Post" && frame.id) {
        queryClient.invalidateQueries({
          queryKey: ["posts", frame.id as string],
          refetchType: "active",
        });
      }
      break;
    }
  }
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const clientRef = useRef<RealtimeClient | null>(null);
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const subscriptionsRef = useRef<Map<string, Set<FrameHandler>>>(new Map());

  useEffect(() => {
    if (!token) return;
    let destroyed = false;

    const getTokens = async () => {
      try {
        const res = await apiFetch("/api/auth/token");
        if (!res.ok) return null;
        const data = await res.json();
        return {
          accessToken: data.accessToken ?? token,
          rbacToken: data.rbacToken ?? "",
          deviceToken: data.deviceToken ?? "",
          userToken: data.userToken ?? "",
        };
      } catch {
        return null;
      }
    };

    const onFrame = (frame: Record<string, unknown>) => {
      if (destroyed) return;
      dispatchRenewFrame(queryClient, frame);
      const subs = subscriptionsRef.current.get(frame.type as string);
      if (subs) {
        for (const handler of subs) {
          handler(frame);
        }
      }
    };

    const client = new RealtimeClient(
      clientEnv.NEXT_PUBLIC_REALTIME_WS_URL,
      getTokens,
      setStatus,
      onFrame,
    );

    clientRef.current = client;
    client.connect();
    client.registerServices(["MESSAGE", "NOTIFICATION"]);

    return () => {
      destroyed = true;
      client.disconnect();
      clientRef.current = null;
    };
  }, [token, queryClient]);

  const send = useCallback((data: Record<string, unknown>) => {
    clientRef.current?.send(data);
  }, []);

  const subscribe = useCallback(
    (type: string, handler: FrameHandler): (() => void) => {
      if (!subscriptionsRef.current.has(type))
        subscriptionsRef.current.set(type, new Set());
      subscriptionsRef.current.get(type)!.add(handler);
      return () => {
        subscriptionsRef.current.get(type)?.delete(handler);
      };
    },
    [],
  );

  const watch = useCallback((topic: string) => {
    clientRef.current?.watch(topic);
  }, []);

  const unwatch = useCallback((topic: string) => {
    clientRef.current?.unwatch(topic);
  }, []);

  const registerServices = useCallback((services: string[]) => {
    clientRef.current?.registerServices(services);
  }, []);

  return (
    <RealtimeContext.Provider
      value={{ status, send, subscribe, watch, unwatch, registerServices }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return ctx;
}

export function useRealtimeStatus(): RealtimeStatus {
  return useRealtime().status;
}
