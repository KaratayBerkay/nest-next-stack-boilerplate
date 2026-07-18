import { queryOptions } from "@tanstack/react-query";
import type {
  NotificationsResult,
  NotificationItem,
} from "@/api/server/notifications/list";

async function fetchNotifications(): Promise<NotificationsResult> {
  const { fetchNotificationsServer } = await import("@/api/server/notifications/list");
  return fetchNotificationsServer();
}

async function fetchUnreadCount(): Promise<number> {
  const { fetchUnreadNotificationCountServer } = await import("@/api/server/notifications/unread-count");
  return fetchUnreadNotificationCountServer();
}

async function fetchDmUnreadCount(): Promise<number> {
  const { fetchDmUnreadCountServer } = await import("@/api/server/notifications/dm-unread-count");
  return fetchDmUnreadCountServer();
}

export function notificationsQueryOptions() {
  return queryOptions({
    queryKey: ["notifications", "list"],
    queryFn: fetchNotifications,
    staleTime: 30_000,
  });
}

export function unreadCountQueryOptions() {
  return queryOptions({
    queryKey: ["notifications", "count"],
    queryFn: fetchUnreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function dmUnreadCountQueryOptions() {
  return queryOptions({
    queryKey: ["notifications", "dm-count"],
    queryFn: fetchDmUnreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
