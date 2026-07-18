"use client";

import { useMemo } from "react";
import type { NotificationListProps } from "@/types/feed/NotificationList-types";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";

export function NotificationList({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  lang = "en",
}: NotificationListProps) {
  const unread = notifications.filter((n) => !n.readAt);
  const dateDisplay = useDateDisplayCookie();

  const sorted = useMemo(
    () =>
      [...notifications].sort((a, b) => {
        const aUnread = a.readAt ? 0 : 1;
        const bUnread = b.readAt ? 0 : 1;
        if (aUnread !== bUnread) return bUnread - aUnread;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
    [notifications],
  );

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-muted text-xs font-semibold tracking-wider uppercase">
          Notifications
        </p>
        {unread.length > 0 && (
          <button
            onClick={() => {
              onMarkAllRead();
            }}
            className="text-brand text-[10px] font-medium hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted px-3 py-4 text-center text-xs">
          No notifications yet
        </p>
      ) : (
        <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
          {sorted.slice(0, 20).map((n) => (
            <button
              key={n.id}
              onClick={() => {
                onMarkRead(n.id);
                onNavigate(n);
              }}
              className={`hover:bg-surface-hover flex items-start gap-2 rounded-lg px-2 py-2 text-left ${
                !n.readAt ? "bg-brand/5" : ""
              }`}
            >
              <div className="bg-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white">
                {n.actor?.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-fg truncate text-xs font-medium">
                  {n.title}
                </p>
                {n.body && (
                  <p className="text-muted line-clamp-2 text-[11px]">
                    {n.body}
                  </p>
                )}
                <p className="text-muted mt-0.5 text-[10px]">
                  {formatDateByPreference(n.createdAt, dateDisplay)}
                </p>
              </div>
              {!n.readAt && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="border-border border-t">
        <Link
          href={`/v1/${lang}/notification`}
          className="text-muted hover:bg-surface-hover flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium"
        >
          See more
          <IconChevronRight size={14} stroke={1.5} />
        </Link>
      </div>
    </div>
  );
}
