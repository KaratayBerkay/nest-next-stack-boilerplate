"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MessageDropdownProps } from "@/types/v1/MessageDropdown-types";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useBreakpoint } from "@/hooks";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { conversationPreviewText } from "@/lib/messages/conversation-preview";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { getActivePeerId } from "@/lib/realtime/active-peer";
import { routeToPageClaim } from "@/lib/realtime/route-mapping";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { createPortal } from "react-dom";
import { IconMail, IconChevronRight, IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { Badge } from "@/components/feed/Badge";

const AUTO_OPEN_MS = 3000;

export function MessageDropdown({ conversations, lang }: MessageDropdownProps) {
  const t = useMessages("v1-shell");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isDesktop = useBreakpoint("sm");
  const realtime = useRealtime();
  const { user } = useAuth();
  const ownUserId = user?.id;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathnameRef = useRef(pathname);
  const searchParamsRef = useRef(searchParams);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const unread = useMemo(
    () => conversations.filter((c) => c.unread > 0),
    [conversations],
  );

  useEffect(() => {
    pathnameRef.current = pathname;
    searchParamsRef.current = searchParams;
  }, [pathname, searchParams]);

  useClickOutside(ref, () => {
    if (isDesktop) setOpen(false);
  });

  // Auto-pop this same dropdown for a few seconds when a DM arrives, reusing
  // the existing unread-list UI instead of a separate notification bubble.
  // Desktop-only: the mobile variant below is a full-screen takeover, which
  // would be a jarring thing to force open uninvited.
  useEffect(() => {
    if (!realtime || !ownUserId || !isDesktop) return;

    const unsub = realtime.subscribe("direct-message", (frame) => {
      const msg = frame.message as
        { id?: string; senderId?: string } | undefined;
      if (!msg?.id || !msg.senderId || msg.senderId === ownUserId) return;

      // Never auto-pop for a thread the user is already looking at: that
      // message is auto-marked read on arrival (see event-dispatch), so the
      // popup would open onto "No unread messages". The live signal is
      // activePeerId — sidebar clicks select a peer without touching the
      // URL, so the ?user= claim below only covers the deep-link window
      // before the messages page has resolved the param into a selection.
      if (getActivePeerId() === msg.senderId) return;

      const claim = routeToPageClaim(
        pathnameRef.current,
        searchParamsRef.current,
      );
      if (claim.page === "messages" && claim.params?.peer === msg.senderId) {
        return;
      }

      setOpen(true);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = setTimeout(
        () => setOpen(false),
        AUTO_OPEN_MS,
      );
    });

    return () => {
      unsub();
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, [realtime, ownUserId, isDesktop]);

  const toggle = () => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    setOpen((p) => !p);
  };

  const content = (
    <>
      <p className="text-muted px-3 py-2 text-xs font-semibold tracking-wider uppercase">
        {t.inbox}
      </p>
      {unread.length === 0 ? (
        <p className="text-muted px-3 py-4 text-center text-xs">{t.noUnread}</p>
      ) : (
        <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {unread.map((c) => (
            <button
              key={c.user.id}
              onClick={() => {
                setOpen(false);
                router.push(`/v1/${lang}/messages?user=${c.user.id}`);
              }}
              className="hover:bg-surface-hover flex items-center gap-2 rounded-lg px-2 py-2 text-left"
            >
              <Avatar
                fallback={initials(c.user.name)}
                className="bg-brand text-brand-fg h-8 w-8 shrink-0 text-[10px]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-fg truncate text-sm font-medium">
                  {c.user.name}
                </p>
                <p className="text-muted truncate text-xs">
                  {conversationPreviewText(c.lastMessage, c.hasAttachments, t)}
                </p>
              </div>
              <span className="bg-error text-error-fg flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold">
                {c.unread > 99 ? "99+" : c.unread}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="border-border border-t">
        <Link
          href={`/v1/${lang}/messages`}
          onClick={() => setOpen(false)}
          className="text-muted hover:bg-surface-hover flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium"
        >
          {t.viewAll}
          <IconChevronRight size={14} stroke={1.5} />
        </Link>
      </div>
    </>
  );

  return (
    <div ref={ref} className="relative">
      <IconButton
        icon={
          <>
            <IconMail size={20} stroke={1.5} />
            <Badge count={unread.length} />
          </>
        }
        label={t.inbox}
        onClick={toggle}
      />

      {open && isDesktop && (
        <div className="border-border bg-bg absolute top-full right-0 z-50 mt-3 w-72 rounded-xl border p-1 shadow-lg">
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
              className="bg-overlay/50 fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-semibold">{t.inbox}</span>
                <IconButton
                  icon={<IconX size={20} stroke={1.5} />}
                  label={t.close}
                  onClick={() => setOpen(false)}
                />
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
