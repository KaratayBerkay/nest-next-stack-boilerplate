import type { NotificationItem } from "@/lib/realtime/useNotifications";

export interface NotificationListProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (n: NotificationItem) => void;
  onSeeMore?: () => void;
  lang?: string;
}
