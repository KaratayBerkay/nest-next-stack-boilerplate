"use client";

import { useCallback, useEffect, useMemo, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconBell,
  IconBellOff,
  IconChevronLeft,
  IconArrowLeft,
} from "@tabler/icons-react";
import { apiFetch } from "@/lib/api-client";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useDeviceType } from "@/hooks/useDeviceType";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SkeletonMessage } from "@/components/ui/skeleton-shapes";
import { NOTIFICATIONS_READ_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { PageInfoButton } from "@/components/ui/page-info";
import { notificationPageInfo } from "@/constants/page-info";
import { NotificationFallback } from "@/fallbacks";
import {
  useNotifications,
} from "@/lib/realtime/useNotifications";
import { formatDate } from "@/lib/date-time";
import { useQueryClient } from "@tanstack/react-query";
import { notificationTarget } from "@/lib/notifications/target";
import { useMessages } from "@/lib/i18n/MessagesProvider";

function NotificationPageContent() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useMessages("notification");
  const { data: notifData, isLoading } = useNotifications();
  const notifications = useMemo(
    () => notifData?.items ?? [],
    [notifData?.items],
  );

  const markedRef = useRef(false);

  const markAllReadOnce = useCallback(async () => {
    try {
      await apiFetch(NOTIFICATIONS_READ_URL, {
        method: POST,
        body: JSON.stringify({ all: true }),
      });
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    } catch {}
  }, [queryClient]);

  useEffect(() => {
    if (notifications.length > 0 && !markedRef.current) {
      markedRef.current = true;
      markAllReadOnce();
    }
  }, [notifications.length, markAllReadOnce]);

  const markRead = useCallback(
    async (id: string) => {
      try {
        await apiFetch(NOTIFICATIONS_READ_URL, {
          method: POST,
          body: JSON.stringify({ id }),
        });
        await queryClient.invalidateQueries({
          queryKey: ["notifications"],
        });
      } catch {}
    },
    [queryClient],
  );

  const notifSwipeRef = useYSwipeGesture<HTMLDivElement>();

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
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-hover"
            aria-label="Back"
          >
            <IconArrowLeft size={20} stroke={1.5} />
          </button>
          <h2 className="text-sm font-semibold text-fg">{t.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {supported && permission !== "granted" && (
            <button
              onClick={requestPermission}
              className="p-1 text-muted hover:text-fg"
              aria-label={t.enablePush}
            >
              <IconBellOff size={16} stroke={1.5} />
            </button>
          )}
          {subscription && (
            <button
              onClick={unsubscribe}
              className="p-1 text-brand hover:text-fg"
              aria-label={t.disablePush}
            >
              <IconBell size={16} stroke={1.5} />
            </button>
          )}
          {unread.length > 0 && (
            <button
              onClick={markAllReadOnce}
              className="text-xs font-medium text-brand hover:underline"
            >
              {t.markAllRead}
            </button>
          )}
          <PageInfoButton content={notificationPageInfo} />
        </div>
      </div>

      <div
        ref={notifSwipeRef}
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

        {isLoading ? (
          <div className="flex flex-col gap-1 px-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonMessage key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <IconBell size={32} stroke={1} className="text-muted" />
            <p className="text-xs text-muted">{t.noNotifications}</p>
          </div>
        ) : (
          sorted.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                markRead(n.id);
                const target = notificationTarget(
                  n.payload as Record<string, unknown> | undefined,
                  lang,
                );
                if (target) router.push(target);
              }}
              className={`flex items-start gap-2.5 rounded-xl px-3 py-3 text-left hover:bg-surface-hover ${
                !n.readAt ? "bg-brand/5" : ""
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                {n.actor?.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg">{n.title}</p>
                {n.body && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                    {n.body}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-muted">
                  {formatDate(n.createdAt)}
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

export function FreePageView() {
  return (
    <Suspense fallback={<NotificationFallback />}>
      <ErrorBoundary>
        <NotificationPageContent />
      </ErrorBoundary>
    </Suspense>
  );
}
