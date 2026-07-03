"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconBell,
  IconBellOff,
  IconChevronLeft,
  IconArrowLeft,
} from "@tabler/icons-react";
import { apiFetch } from "@/lib/api-client";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useDeviceType } from "@/hooks/useDeviceType";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body?: string;
  readAt?: string;
  createdAt: string;
  actor?: { name?: string };
};

function NotificationPageContent() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const items: NotificationItem[] = data?.notifications ?? data ?? [];
        setNotifications(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = useCallback(async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiFetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
      );
    } catch {}
  }, []);
  const {
    supported,
    permission,
    subscription,
    requestPermission,
    unsubscribe,
  } = usePushNotifications();
  const pointer = useDeviceType();
  const isTouch = pointer === "touch";

  const goToFeed = useCallback(() => {
    router.push(`/v1/${lang}/feed`);
  }, [router, lang]);

  const { progress, direction, isSwiping } = useSwipeGesture({
    threshold: 60,
    onSwipeLeft: goToFeed,
    enabled: isTouch,
  });

  const unread = notifications.filter((n) => !n.readAt);
  const sorted = [...notifications].sort((a, b) => {
    const aUnread = a.readAt ? 0 : 1;
    const bUnread = b.readAt ? 0 : 1;
    if (aUnread !== bUnread) return bUnread - aUnread;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const translateX =
    isSwiping && direction === "left" ? `-${progress * 40}px` : "0px";
  const opacity = isSwiping && direction === "left" ? 1 - progress * 0.3 : 1;

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="text-muted hover:bg-surface-hover rounded-lg p-1.5"
            aria-label="Back"
          >
            <IconArrowLeft size={20} stroke={1.5} />
          </button>
          <h2 className="text-fg text-sm font-semibold">Notifications</h2>
        </div>
        <div className="flex items-center gap-2">
          {supported && permission !== "granted" && (
            <button
              onClick={requestPermission}
              className="text-muted hover:text-fg p-1"
              aria-label="Enable push notifications"
            >
              <IconBellOff size={16} stroke={1.5} />
            </button>
          )}
          {subscription && (
            <button
              onClick={unsubscribe}
              className="text-brand hover:text-fg p-1"
              aria-label="Disable push notifications"
            >
              <IconBell size={16} stroke={1.5} />
            </button>
          )}
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="text-brand text-xs font-medium hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1 pb-4 transition-none"
        style={{
          transform: `translateX(${translateX})`,
          opacity,
        }}
      >
        {isSwiping && direction === "left" && (
          <div className="pointer-events-none fixed inset-y-0 right-0 z-50 flex w-12 items-center justify-center">
            <IconChevronLeft
              size={24}
              stroke={1.5}
              className="text-muted"
              style={{ opacity: progress }}
            />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-1 px-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface-hover/50 flex animate-pulse items-start gap-2.5 rounded-xl px-3 py-3"
              >
                <div className="bg-muted h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="bg-muted h-3 w-3/4 rounded" />
                  <div className="bg-muted h-2 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <IconBell size={32} stroke={1} className="text-muted" />
            <p className="text-muted text-xs">No notifications yet</p>
          </div>
        ) : (
          sorted.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`hover:bg-surface-hover flex items-start gap-2.5 rounded-xl px-3 py-3 text-left ${
                !n.readAt ? "bg-brand/5" : ""
              }`}
            >
              <div className="bg-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                {n.actor?.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-fg text-sm font-medium">{n.title}</p>
                {n.body && (
                  <p className="text-muted mt-0.5 line-clamp-2 text-xs">
                    {n.body}
                  </p>
                )}
                <p className="text-muted mt-1 text-[10px]">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!n.readAt && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function NotificationPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted flex animate-pulse items-center justify-center py-20 text-sm">
          Loading...
        </div>
      }
    >
      <ErrorBoundary>
        <NotificationPageContent />
      </ErrorBoundary>
    </Suspense>
  );
}
