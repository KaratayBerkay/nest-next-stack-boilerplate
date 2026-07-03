import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

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
      const res = await apiFetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.items ?? data ?? [];
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
      const res = await apiFetch("/api/notifications/unread-count");
      if (!res.ok) throw new Error("Failed to fetch unread count");
      const data = await res.json();
      return typeof data === "number" ? data : data.count ?? 0;
    },
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}
