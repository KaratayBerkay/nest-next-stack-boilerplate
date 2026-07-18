import { useQuery } from "@tanstack/react-query";
import { notificationsQueryOptions, unreadCountQueryOptions, dmUnreadCountQueryOptions } from "@/api/client/notifications/query";

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
  return useQuery(notificationsQueryOptions());
}

export function useUnreadNotificationCount() {
  return useQuery(unreadCountQueryOptions());
}

export function useDmUnreadCount() {
  return useQuery(dmUnreadCountQueryOptions());
}
