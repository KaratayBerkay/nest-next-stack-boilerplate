"use client";

import { useRef, useCallback, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useBreakpoint } from "@/hooks";
import { IconBell, IconChevronRight } from "@tabler/icons-react";
import { formatDate } from "@/lib/date-time";
import {
  useNotifications,
  useUnreadNotificationCount,
  useDmUnreadCount,
} from "@/lib/realtime/useNotifications";
import type { NotificationItem } from "@/lib/realtime/useNotifications";
import { notificationTarget } from "@/lib/notifications/target";
import { useQueryClient } from "@tanstack/react-query";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ring-bg absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NotificationList({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  lang = "en",
}: {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (n: NotificationItem) => void;
  lang?: string;
}) {
  const unread = notifications.filter((n) => !n.readAt);

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
                  {formatDate(n.createdAt)}
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

export function NotificationDropdown({ lang = "en" }: { lang?: string }) {
  const { data: notifData } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: dmCount = 0 } = useDmUnreadCount();
  const notifications = notifData?.items ?? [];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useBreakpoint("sm");

  useClickOutside(ref, () => {
    if (isDesktop) setOpen(false);
  });

  const queryClient = useQueryClient();

  const markRead = useCallback(async (id: string) => {
    try {
      await apiFetch("/api/notifications/read", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {}
  }, [queryClient]);

  const markAllRead = useCallback(async () => {
    try {
      await apiFetch("/api/notifications/read", {
        method: "POST",
        body: JSON.stringify({ all: true }),
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {}
  }, [queryClient]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleNavigate = (n: NotificationItem) => {
    const target = notificationTarget(
      n.payload as Record<string, unknown> | undefined,
      lang,
    );
    if (target) {
      router.push(target);
      setOpen(false);
    }
  };

  const content = (
    <NotificationList
      notifications={notifications}
      onMarkRead={markRead}
      onMarkAllRead={markAllRead}
      onNavigate={handleNavigate}
      lang={lang}
    />
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="text-muted hover:bg-surface-hover relative rounded-lg p-1.5"
      >
        <IconBell size={20} stroke={1.5} />
        <Badge count={unreadCount + dmCount} />
      </button>

      {open && isDesktop && (
        <div className="border-border bg-bg absolute top-full right-0 z-50 mt-3 w-80 rounded-xl border p-1 shadow-lg">
          {content}
        </div>
      )}

      {open &&
        !isDesktop &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <div className="bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-semibold">Notifications</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted hover:bg-surface-hover rounded-lg p-1"
                  aria-label="Close"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
                {content}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
