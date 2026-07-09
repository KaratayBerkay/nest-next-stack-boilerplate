import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { NOTIFICATIONS_URL, NOTIFICATIONS_UNREAD_COUNT_URL, MESSAGES_UNREAD_COUNT_URL } from "@/constants/api/urls";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  actor: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export function useNotifications() {
  return useQuery<{ items: NotificationItem[]; hasMore: boolean }>({
    queryKey: ["notifications", "list"],
    queryFn: async () => {
      const res = await apiFetch(NOTIFICATIONS_URL);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.notifications)
            ? data.notifications
            : [];
      return { items, hasMore: data?.hasMore ?? false };
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery<number>({
    queryKey: ["notifications", "count"],
    queryFn: async () => {
      const res = await apiFetch(NOTIFICATIONS_UNREAD_COUNT_URL);
      if (!res.ok) throw new Error("Failed to fetch unread count");
      const data = await res.json();
      return typeof data === "number" ? data : data.count ?? 0;
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useDmUnreadCount() {
  return useQuery<number>({
    queryKey: ["notifications", "dm-count"],
    queryFn: async () => {
      const res = await apiFetch(MESSAGES_UNREAD_COUNT_URL);
      if (!res.ok) return 0;
      const data = await res.json();
      return typeof data.count === "number" ? data.count : 0;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
