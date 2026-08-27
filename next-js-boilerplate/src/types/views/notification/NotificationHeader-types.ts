export interface NotificationHeaderProps {
  title: string;
  supported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  requestPermission: () => void;
  unsubscribe: () => void;
  unreadCount: number;
  markAllRead: () => void;
  backLabel: string;
  markAllReadLabel: string;
  enablePushLabel: string;
  disablePushLabel: string;
  pushBlockedLabel: string;
  navigateToFeed: () => void;
}
