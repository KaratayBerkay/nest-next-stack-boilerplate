"use client";

import { useEffect } from "react";
import { useNotifications } from "@/lib/realtime/useNotifications";
import { useQueryClient } from "@tanstack/react-query";
import { markNotificationReadServer } from "@/api/server/notifications/mark-read";

export function useMarkPostNotificationsRead(postId: string) {
  const queryClient = useQueryClient();
  const { data: notifData } = useNotifications();

  useEffect(() => {
    const items = notifData?.pages.flatMap((p) => p.items) ?? [];
    if (!postId || items.length === 0) return;

    const unread = items.filter(
      (n) =>
        !n.readAt && (n.payload as Record<string, unknown>)?.postId === postId,
    );

    if (unread.length === 0) return;

    let cancelled = false;

    Promise.all(
      unread.map((n) => markNotificationReadServer(n.id).catch(() => {})),
    ).then(() => {
      if (!cancelled) {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [postId, notifData, queryClient]);
}
