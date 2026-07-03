"use client";

import { useState, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { clientEnv } from "@/lib/env";
import { apiFetch } from "@/lib/api-client";

export interface NotificationItem {
  id: string;
  title: string;
  body?: string | null;
  type: string;
  readAt?: string | null;
  createdAt: string;
  payload?: Record<string, unknown> | null;
  actor?: { id: string; name: string; email: string } | null;
}

const POLL_INTERVAL = 30_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const mounted = { current: true };

    const fetchToken = () =>
      apiFetch("/api/auth/token")
        .then((r) => r.json() as Promise<{ token: string }>)
        .then((d) => d.token)
        .catch(() => null);

    const initialFetch = () =>
      Promise.all([
        apiFetch("/api/notifications")
          .then(
            (r) => r.json() as Promise<{ notifications: NotificationItem[] }>,
          )
          .then((data) => {
            if (mounted.current) setNotifications(data.notifications ?? []);
          })
          .catch(() => {}),
        apiFetch("/api/notifications/unread-count")
          .then((r) => r.json() as Promise<{ count: number }>)
          .then((data) => {
            if (mounted.current) setUnreadCount(data.count ?? 0);
          })
          .catch(() => {}),
      ]);

    const startPolling = () => {
      intervalRef.current = setInterval(() => {
        apiFetch("/api/notifications/unread-count")
          .then((r) => r.json() as Promise<{ count: number }>)
          .then((data) => {
            if (mounted.current) setUnreadCount(data.count ?? 0);
          })
          .catch(() => {});
      }, POLL_INTERVAL);
    };

    const connectSocket = async () => {
      const token = await fetchToken();
      if (!token || !mounted.current) return;

      const socketUrl = clientEnv.NEXT_PUBLIC_REALTIME_WS_URL.replace(/\/+$/, "");
      const socket = io(`${socketUrl}/notifications`, {
        auth: { token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.on("notification", (data: NotificationItem) => {
        if (!mounted.current) return;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === data.id)) return prev;
          return [data, ...prev];
        });
        setUnreadCount((c) => c + 1);
      });
    };

    initialFetch().finally(() => {
      if (mounted.current) setLoading(false);
    });

    startPolling();
    connectSocket();

    return () => {
      mounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const markRead = async (id: string) => {
    try {
      await apiFetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() })),
      );
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  const refresh = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        apiFetch("/api/notifications"),
        apiFetch("/api/notifications/unread-count"),
      ]);
      const notifData = (await notifRes.json()) as {
        notifications: NotificationItem[];
      };
      const countData = (await countRes.json()) as { count: number };
      setNotifications(notifData.notifications ?? []);
      setUnreadCount(countData.count ?? 0);
    } catch {
      /* ignore */
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh,
  };
}
