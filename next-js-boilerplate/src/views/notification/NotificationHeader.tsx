"use client";

import { IconBell, IconBellOff, IconArrowLeft } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { PageInfoButton } from "@/components/ui/page-info";
import { notificationPageInfo } from "@/constants/page-info";

interface NotificationHeaderProps {
  title: string;
  supported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  requestPermission: () => void;
  unsubscribe: () => void;
  unreadCount: number;
  markAllRead: () => void;
  markAllReadLabel: string;
  enablePushLabel: string;
  disablePushLabel: string;
  navigateToFeed: () => void;
}

export function NotificationHeader({
  title,
  supported,
  permission,
  subscription,
  requestPermission,
  unsubscribe,
  unreadCount,
  markAllRead,
  markAllReadLabel,
  enablePushLabel,
  disablePushLabel,
  navigateToFeed,
}: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <IconButton
          icon={<IconArrowLeft size={20} stroke={1.5} />}
          label="Back"
          onClick={navigateToFeed}
        />
        <h2 className="text-fg text-sm font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {supported && permission !== "granted" && (
          <IconButton
            icon={<IconBellOff size={16} stroke={1.5} />}
            label={enablePushLabel}
            onClick={requestPermission}
          />
        )}
        {subscription && (
          <IconButton
            icon={<IconBell size={16} stroke={1.5} />}
            label={disablePushLabel}
            onClick={unsubscribe}
          />
        )}
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-brand text-xs font-medium hover:underline"
          >
            {markAllReadLabel}
          </button>
        )}
        <PageInfoButton content={notificationPageInfo} />
      </div>
    </div>
  );
}
