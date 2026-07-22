"use client";

import { formatDateByPreference } from "@/lib/date-time";
import { notificationTarget } from "@/lib/notifications/target";
import type { DateDisplayFormat } from "@/constants/date-display";
import type { NotificationItem as NotificationItemType } from "@/lib/realtime/useNotifications";

interface NotificationItemProps {
  notification: NotificationItemType;
  onRead: (id: string) => void;
  onNavigate: (target: string) => void;
  lang: string;
  dateDisplay: DateDisplayFormat;
}

export function NotificationItem({
  notification: n,
  onRead,
  onNavigate,
  lang,
  dateDisplay,
}: NotificationItemProps) {
  return (
    <button
      onClick={() => {
        onRead(n.id);
        const target = notificationTarget(
          n.payload as Record<string, unknown> | undefined,
          lang,
        );
        if (target) onNavigate(target);
      }}
      className={`hover:bg-surface-hover flex items-start gap-2.5 rounded-xl px-3 py-3 text-left ${
        !n.readAt ? "bg-brand/5" : ""
      }`}
    >
      <div className="bg-brand text-brand-fg flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        {n.actor?.name?.charAt(0).toUpperCase() ?? "?"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-fg text-sm font-medium">{n.title}</p>
        {n.body && (
          <p className="text-muted mt-0.5 line-clamp-2 text-xs">{n.body}</p>
        )}
        <p className="text-muted mt-1 text-[10px]">
          {formatDateByPreference(n.createdAt, dateDisplay)}
        </p>
      </div>
      {!n.readAt && (
        <span className="bg-info mt-2 h-2 w-2 shrink-0 rounded-full" />
      )}
    </button>
  );
}
