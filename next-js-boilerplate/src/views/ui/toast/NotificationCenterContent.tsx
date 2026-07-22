"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";

interface NotificationItem {
  id: string;
  initials: string;
  title: string;
  time: string;
  unread: boolean;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    initials: "A",
    title: "Alex commented on your post",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    initials: "S",
    title: "Sarah accepted your invitation",
    time: "1h ago",
    unread: true,
  },
  {
    id: "3",
    initials: "S",
    title: "System update completed",
    time: "3h ago",
    unread: false,
  },
  {
    id: "4",
    initials: "N",
    title: "New team member joined",
    time: "yesterday",
    unread: false,
  },
  {
    id: "5",
    initials: "P",
    title: "Payment received",
    time: "2 days ago",
    unread: false,
  },
];

function handleNotificationClick(
  notification: NotificationItem,
  toast: (opts: {
    title: string;
    description: string;
    variant?: "default" | "destructive" | "success";
    duration?: number;
  }) => void,
) {
  toast({
    title: notification.title,
    description: `${notification.time}`,
    variant: notification.unread ? "default" : "success",
    duration: 4000,
  });
}

function handleMarkAllRead(
  toast: (opts: {
    title: string;
    description: string;
    variant?: "default" | "destructive" | "success";
  }) => void,
) {
  toast({
    title: "Marked all as read",
    description: "All notifications have been marked as read.",
    variant: "success",
  });
}

export function NotificationCenterContent() {
  const { toast } = useToast();
  const [items] = useState(NOTIFICATIONS);

  return (
    <div className="mx-auto max-w-md space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Notifications ({items.length})
        </h3>
        <button
          className="text-brand text-sm hover:underline"
          onClick={() => handleMarkAllRead(toast)}
        >
          Mark all read
        </button>
      </div>
      <Separator />
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            className="hover:bg-surface/50 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
            onClick={() => handleNotificationClick(item, toast)}
          >
            <Avatar
              size="sm"
              fallback={item.initials}
              variant={item.unread ? "brand" : "default"}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-muted text-xs">{item.time}</p>
            </div>
            {item.unread && (
              <Badge variant="default" className="shrink-0">
                New
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
