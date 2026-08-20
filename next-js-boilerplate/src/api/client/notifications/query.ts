import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import type { NotificationsResult } from "@/api/server/notifications/list";

async function fetchNotifications(
  cursor?: string,
): Promise<NotificationsResult> {
  const { fetchNotificationsServer } =
    await import("@/api/server/notifications/list");
  return fetchNotificationsServer(cursor);
}

async function fetchUnreadCount(): Promise<number> {
  const { fetchUnreadNotificationCountServer } =
    await import("@/api/server/notifications/unread-count");
  return fetchUnreadNotificationCountServer();
}

async function fetchDmUnreadCount(): Promise<number> {
  const { fetchDmUnreadCountServer } =
    await import("@/api/server/notifications/dm-unread-count");
  return fetchDmUnreadCountServer();
}

export function notificationsQueryOptions() {
  return infiniteQueryOptions<NotificationsResult>({
    queryKey: ["notifications", "list"],
    queryFn: async ({ pageParam }) =>
      fetchNotifications(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    // Items arrive newest-first per page (no reversal, unlike the
    // chat-message pagination) — the cursor is the id of the oldest item
    // fetched so far.
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.items[lastPage.items.length - 1]?.id
        : undefined,
    staleTime: 30_000,
    refetchInterval: 60_000,
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
