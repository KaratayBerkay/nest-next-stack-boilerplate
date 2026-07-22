"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconBell, IconChevronLeft } from "@tabler/icons-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useDeviceType } from "@/hooks/useDeviceType";
import { SkeletonMessage } from "@/components/ui/skeleton-shapes";
import { useNotifications } from "@/lib/realtime/useNotifications";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useNotificationActions } from "@/api/client/notifications/actions";
import { cn } from "@/lib/cn";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationItem } from "./NotificationItem";
import type { ClassNameProps } from "@/types/ui/ClassName-types";

function navigateToFeed(router: ReturnType<typeof useRouter>, lang: string) {
  router.push(`/v1/${lang}/feed`);
}

export function NotificationPageContent({ className }: ClassNameProps) {
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
      <NotificationHeader
        title={t.title}
        supported={supported}
        permission={permission}
        subscription={subscription}
        requestPermission={requestPermission}
        unsubscribe={unsubscribe}
        unreadCount={unread.length}
        markAllRead={markAllRead}
        markAllReadLabel={t.markAllRead}
        enablePushLabel={t.enablePush}
        disablePushLabel={t.disablePush}
        navigateToFeed={goToFeed}
      />

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
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={markRead}
              onNavigate={(target) => router.push(target)}
              lang={lang}
              dateDisplay={dateDisplay}
            />
          ))
        )}
      </div>
    </div>
  );
}
