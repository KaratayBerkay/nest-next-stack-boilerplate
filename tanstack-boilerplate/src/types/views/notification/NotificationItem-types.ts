import type { DateDisplayFormat } from "@/constants/date-display";
import type { NotificationItem as NotificationItemType } from "@/lib/realtime/useNotifications";

export interface NotificationItemProps {
  notification: NotificationItemType;
  onRead: (id: string) => void;
  onNavigate: (target: string) => void;
  lang: string;
  dateDisplay: DateDisplayFormat;
}
