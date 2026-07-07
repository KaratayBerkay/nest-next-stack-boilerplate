"use client";

import { useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { useNotifications } from "@/lib/realtime/useNotifications";
import { useQueryClient } from "@tanstack/react-query";

export function useMarkPostNotificationsRead(postId: string) {
  const queryClient = useQueryClient();
  const { data: notifData } = useNotifications();

  useEffect(() => {
    if (!postId || !notifData?.items?.length) return;

    const unread = notifData.items.filter(
      (n) =>
        !n.readAt &&
        (n.payload as Record<string, unknown>)?.postId === postId,
    );

    if (unread.length === 0) return;

    let cancelled = false;

    Promise.all(
      unread.map((n) =>
        apiFetch("/api/notifications/read", {
          method: "POST",
          body: JSON.stringify({ id: n.id }),
        }).catch(() => {}),
      ),
    ).then(() => {
      if (!cancelled) {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [postId, notifData?.items, queryClient]);
}
