"use client";

import { IconBell, IconBellOff, IconArrowLeft } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { Button } from "@/components/ui/Button";
import { PageInfoButton } from "@/components/ui/page-info";
import { notificationPageInfo } from "@/constants/page-info";
import type { NotificationHeaderProps } from "@/types/views/notification/NotificationHeader-types";

export function NotificationHeader({
  title,
  supported,
  permission,
  subscription,
  requestPermission,
  unsubscribe,
  unreadCount,
  markAllRead,
  backLabel,
  markAllReadLabel,
  enablePushLabel,
  disablePushLabel,
  pushBlockedLabel,
  navigateToFeed,
}: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <IconButton
          icon={<IconArrowLeft size={20} stroke={1.5} />}
          label={backLabel}
          onClick={navigateToFeed}
        />
        <h2 className="text-fg text-sm font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {supported && permission === "denied" && (
          <IconButton
            icon={<IconBellOff size={16} stroke={1.5} />}
            label={pushBlockedLabel}
            disabled
          />
        )}
        {supported && permission === "default" && (
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
          <Button variant="link" size="xs" onClick={markAllRead}>
            {markAllReadLabel}
          </Button>
        )}
        <PageInfoButton content={notificationPageInfo} />
      </div>
    </div>
  );
}
