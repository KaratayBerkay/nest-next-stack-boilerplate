"use client";

import { useCallback, useEffect, useMemo, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconBell,
  IconBellOff,
  IconChevronLeft,
  IconArrowLeft,
} from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useDeviceType } from "@/hooks/useDeviceType";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SkeletonMessage } from "@/components/ui/skeleton-shapes";
import { PageInfoButton } from "@/components/ui/page-info";
import { notificationPageInfo } from "@/constants/page-info";
import { NotificationFallback } from "@/fallbacks";
import { useNotifications } from "@/lib/realtime/useNotifications";
import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { notificationTarget } from "@/lib/notifications/target";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useNotificationActions } from "@/api/client/notifications/actions";
import { cn } from "@/lib/cn";

function navigateToFeed(router: ReturnType<typeof useRouter>, lang: string) {
  router.push(`/v1/${lang}/feed`);
}

// Notification list kept live by lib/realtime/renew-dispatch.ts (Notifications/Item) — no direct realtime subscription in this file
function NotificationPageContent({ className }: { className?: string }) {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const router = useRouter();
  const t = useMessages("notification");
  const { data: notifData, isLoading } = useNotifications();
  const dateDisplay = useDateDisplayCookie();
  const notifications = useMemo(
    () => notifData?.items ?? [],
    [notifData?.items],
  );

  const { markAllRead, markRead } = useNotificationActions();

  const markedRef = useRef(false);

  useEffect(() => {
    if (notifications.length > 0 && !markedRef.current) {
      markedRef.current = true;
      markAllRead();
    }
  }, [notifications.length, markAllRead]);

  const notifSwipeRef = useYSwipeGesture<HTMLDivElement>();

  const {
    supported,
    permission,
    subscription,
    requestPermission,
    unsubscribe,
  } = usePushNotifications();
  const _pointer = useDeviceType();

  const goToFeed = useCallback(
    () => navigateToFeed(router, lang),
    [router, lang],
  );

  const { progress, direction, isSwiping } = useSwipeGesture({
    threshold: 60,
    onSwipeLeft: goToFeed,
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
    <div
      className={cn(
        "flex h-full w-full flex-col gap-6 overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconButton
            icon={<IconArrowLeft size={20} stroke={1.5} />}
            label="Back"
            onClick={() => navigateToFeed(router, lang)}
          />
          <h2 className="text-fg text-sm font-semibold">{t.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {supported && permission !== "granted" && (
            <IconButton
              icon={<IconBellOff size={16} stroke={1.5} />}
              label={t.enablePush}
              onClick={requestPermission}
            />
          )}
          {subscription && (
            <IconButton
              icon={<IconBell size={16} stroke={1.5} />}
              label={t.disablePush}
              onClick={unsubscribe}
            />
          )}
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="text-brand text-xs font-medium hover:underline"
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
            <p className="text-muted text-xs">{t.noNotifications}</p>
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
                  <p className="text-muted mt-0.5 line-clamp-2 text-xs">
                    {n.body}
                  </p>
                )}
                <p className="text-muted mt-1 text-[10px]">
                  {formatDateByPreference(n.createdAt, dateDisplay)}
                </p>
              </div>
              {!n.readAt && (
                <span className="bg-info mt-2 h-2 w-2 shrink-0 rounded-full" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function FreePageView({ className }: { className?: string }) {
  return (
    <Suspense fallback={<NotificationFallback />}>
      <ErrorBoundary>
        <NotificationPageContent className={className} />
      </ErrorBoundary>
    </Suspense>
  );
}
