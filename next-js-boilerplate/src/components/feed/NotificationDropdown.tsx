"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { NotificationDropdownProps } from "@/types/feed/NotificationDropdown-types";
import type { NotificationItem } from "@/lib/realtime/useNotifications";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useBreakpoint } from "@/hooks";
import { IconBell } from "@tabler/icons-react";
import { NOTIFICATIONS_READ_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import {
  useNotifications,
  useUnreadNotificationCount,
  useDmUnreadCount,
} from "@/lib/realtime/useNotifications";
import { notificationTarget } from "@/lib/notifications/target";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/feed/Badge";
import { NotificationList } from "@/components/feed/NotificationList";

async function markRead(
  id: string,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  try {
    await apiFetch(NOTIFICATIONS_READ_URL, {
      method: POST,
      body: JSON.stringify({ id }),
    });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  } catch {}
}

async function markAllRead(queryClient: ReturnType<typeof useQueryClient>) {
  try {
    await apiFetch(NOTIFICATIONS_READ_URL, {
      method: POST,
      body: JSON.stringify({ all: true }),
    });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  } catch {}
}

function handleToggle(setOpen: Dispatch<SetStateAction<boolean>>) {
  setOpen((prev) => !prev);
}

function handleNavigate(
  n: NotificationItem,
  lang: string,
  setOpen: Dispatch<SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
) {
  const target = notificationTarget(
    n.payload as Record<string, unknown> | undefined,
    lang,
  );
  if (target) {
    router.push(target);
    setOpen(false);
  }
}

export function NotificationDropdown({
  lang = "en",
}: NotificationDropdownProps) {
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

  const content = (
    <NotificationList
      notifications={notifications}
      onMarkRead={(id) => markRead(id, queryClient)}
      onMarkAllRead={() => markAllRead(queryClient)}
      onNavigate={(n) => handleNavigate(n, lang, setOpen, router)}
      lang={lang}
    />
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => handleToggle(setOpen)}
        className="text-muted hover:bg-surface-hover relative rounded-lg p-1.5"
        aria-label={`Notifications${unreadCount + dmCount > 0 ? ` (${unreadCount + dmCount} unread)` : ""}`}
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
            {/* Decorative dismiss backdrop, not a control — the panel's own controls remain
                keyboard-reachable; this scrim only needs a click target. */}
            <div
              className="fixed inset-0 z-40 bg-overlay/50"
              onClick={() => setOpen(false)}
              aria-hidden="true"
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
