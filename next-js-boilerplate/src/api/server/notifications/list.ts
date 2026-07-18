import { apiFetch } from "@/lib/api-client";
import { NOTIFICATIONS_URL } from "@/constants/api/urls";

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

export interface NotificationsResult {
  items: NotificationItem[];
  hasMore: boolean;
}

export async function fetchNotificationsServer(): Promise<NotificationsResult> {
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
}
