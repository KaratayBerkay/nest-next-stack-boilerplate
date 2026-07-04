"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { RealtimeProvider } from "@/lib/realtime/RealtimeProvider";
import { useConversations, type Conversation } from "@/lib/realtime/useConversations";
import { useDeviceType, useBreakpoint } from "@/hooks";
import { useEdgeSwipe } from "@/hooks/useEdgeSwipe";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LOGIN_PATH } from "@/constants/routes";
import { Avatar } from "@/components/ui/Avatar";
import { Badge as UiBadge } from "@/components/ui/Badge";
import { initials } from "@/lib/initials";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LangSwitcher } from "@/components/layout/LangSwitcher";
import {
  IconMail,
  IconLogout,
  IconChevronRight,
  IconChevronDown,
  IconMenu2,
} from "@tabler/icons-react";
import { NotificationDropdown } from "@/components/feed/NotificationDropdown";
import { V1Nav } from "./V1Nav";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ring-bg absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function MessageDropdown({
  conversations,
  lang,
}: {
  conversations: Conversation[];
  lang: string;
}) {
  const t = useMessages("v1-shell");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isDesktop = useBreakpoint("sm");
  const unread = useMemo(
    () => conversations.filter((c) => c.unread > 0),
    [conversations],
  );

  // Click-outside only on desktop; mobile uses its own backdrop/close button
  useClickOutside(ref, () => {
    if (isDesktop) setOpen(false);
  });

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
                className="bg-brand h-8 w-8 shrink-0 text-[10px] text-white"
              />
              <div className="min-w-0 flex-1">
                <p className="text-fg truncate text-sm font-medium">
                  {c.user.name}
                </p>
                <p className="text-muted truncate text-xs">{c.lastMessage}</p>
              </div>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
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
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-muted hover:bg-surface-hover relative rounded-lg p-1.5"
      >
        <IconMail size={20} stroke={1.5} />
        <Badge count={unread.length} />
      </button>

      {open && isDesktop && (
        <div className="border-border bg-bg absolute top-full right-0 mt-3 w-72 rounded-xl border p-1 shadow-lg">
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
                <span className="text-sm font-semibold">{t.inbox}</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted hover:bg-surface-hover rounded-lg p-1"
                  aria-label={t.close}
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

function ProfileDropdown({
  user,
  logout,
  align = "right",
  children,
}: {
  user: {
    name?: string;
    email: string;
    avatarUrl?: string;
    tier?: string;
  };
  logout: () => void;
  align?: "left" | "right";
  children?: React.ReactNode;
}) {
  const t = useMessages("v1-shell");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useBreakpoint("sm");
  useClickOutside(ref, () => {
    if (isDesktop) setOpen(false);
  });

  const content = (
    <>
      <div className="border-border mb-2 border-b px-2 pb-2">
        <p className="text-fg truncate text-sm font-medium">
          {user.name || "User"}
        </p>
        <p className="text-muted truncate text-xs">{user.email}</p>
        {user.tier && (
          <div className="mt-1">
            <UiBadge variant="secondary">{user.tier}</UiBadge>
          </div>
        )}
      </div>
      <button
        onClick={() => {
          setOpen(false);
          logout();
        }}
        className="hover:bg-surface-hover flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600"
      >
        <IconLogout size={16} stroke={1.5} />
        {t.signOut}
      </button>
    </>
  );

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((p) => !p)} className="cursor-pointer">
        {children}
      </button>

      {open && isDesktop && (
        <div
          className={`border-border bg-bg absolute top-full mt-3 w-56 rounded-xl border p-2 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
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
                <span className="text-sm font-semibold">{t.account}</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted hover:bg-surface-hover rounded-lg p-1"
                  aria-label={t.close}
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

function ProfileSection({
  user,
  logout,
}: {
  user: {
    name?: string;
    email: string;
    avatarUrl?: string;
    tier?: string;
  };
  logout: () => void;
}) {
  const t = useMessages("v1-shell");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="hover:bg-surface-hover flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
      >
        <Avatar
          src={user.avatarUrl}
          fallback={initials(user.name || user.email)}
          className="bg-brand h-8 w-8 shrink-0 text-[11px] text-white"
        />
        <div className="flex min-w-0 flex-1 flex-col text-sm leading-tight">
          <span className="text-fg truncate font-medium">
            {user.name || "User"}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted truncate text-xs">{user.email}</span>
            {user.tier && (
              <span className="rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider">
                {user.tier}
              </span>
            )}
          </div>
        </div>
        <IconChevronDown
          size={16}
          className={`text-muted shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-border bg-surface mt-1 rounded-lg border p-2">
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="hover:bg-surface-hover flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors"
          >
            <IconLogout size={16} stroke={1.5} />
            {t.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

export function V1Shell({ children }: { children: React.ReactNode }) {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "";
  const { user, token, loading, logout } = useAuth();
  const t = useMessages("v1-shell");
  const { data: conversations = [] } = useConversations();
  const pointer = useDeviceType();
  const isTouch = pointer === "touch";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const dragStateRef = useRef<{
    dragging: boolean;
    startX: number;
    currentX: number;
  }>({ dragging: false, startX: 0, currentX: 0 });

  const open = useCallback(() => setSidebarOpen(true), []);
  const close = useCallback(() => setSidebarOpen(false), []);
  const toggle = useCallback(() => setSidebarOpen((p) => !p), []);

  useEdgeSwipe({
    onSwipeRight: open,
    onSwipeLeft: close,
    enabled: isTouch && !sidebarOpen,
  });

  /* swipe-left-to-close on the sidebar itself */
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const onStart = (clientX: number) => {
      dragStateRef.current = {
        dragging: true,
        startX: clientX,
        currentX: clientX,
      };
    };
    const onMove = (clientX: number) => {
      if (!dragStateRef.current.dragging) return;
      dragStateRef.current.currentX = clientX;
    };
    const onEnd = () => {
      if (!dragStateRef.current.dragging) return;
      const dx = dragStateRef.current.currentX - dragStateRef.current.startX;
      dragStateRef.current.dragging = false;
      if (dx < -50) close();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!e.touches.length) return;
      onStart(e.touches[0].clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return;
      onMove(e.touches[0].clientX);
    };
    const handleTouchEnd = () => onEnd();
    const handleMouseDown = (e: MouseEvent) => onStart(e.clientX);
    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const handleMouseUp = () => onEnd();

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [sidebarOpen, close]);

  return (
    <RealtimeProvider>
      <div className="flex h-dvh flex-col">
      {/* Header — part of flow so content below fills remaining space exactly */}
      <header className="border-border bg-bg z-50 flex h-14 shrink-0 items-center border-b">
        {/* Hamburger — toggles sidebar on all sizes */}
        <button
          onClick={toggle}
          className="text-muted hover:bg-surface-hover ml-3 rounded-lg p-1.5"
          aria-label={t.toggleSidebar}
        >
          <IconMenu2 size={20} />
        </button>

        {/* Header left — brand area (click to open sidebar) */}
        <button onClick={open} className="flex h-full items-center gap-2 px-4">
          <div className="bg-brand flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white">
            V
          </div>
          <span className="text-sm font-semibold">{t.brand}</span>
        </button>

        {/* Header right — profile, icons, actions */}
        <div className="flex flex-1 items-center gap-3 px-4 md:px-6">
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <LangSwitcher />
            <ThemeToggle />
            {loading ? (
              <span className="text-muted text-xs">{t.authLoading}</span>
            ) : user ? (
              <>
                <MessageDropdown conversations={conversations} lang={lang} />
                <NotificationDropdown lang={lang} />
                <ProfileDropdown user={user} logout={logout} align="right">
                  <Avatar
                    src={user.avatarUrl}
                    fallback={initials(user.name || user.email)}
                    className="bg-brand ring-border h-8 w-8 shrink-0 text-[11px] text-white ring-2"
                  />
                </ProfileDropdown>
              </>
            ) : (
              <a
                href={LOGIN_PATH}
                className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                {t.signIn}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Content + Sidebar row — fills remaining viewport exactly */}
      <div className="relative flex min-h-0 flex-1">
        {/* Backdrop — mobile only, desktop sidebar is in-flow */}
        {sidebarOpen && (
          <div
            className="animate-fade-in fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={close}
          />
        )}

        {/* Sidebar — below header, closable on all sizes */}
        <aside
          ref={sidebarRef}
          className={cn(
            "bg-bg border-border flex-col overflow-hidden border-r shadow-lg transition-all duration-300 ease-out motion-reduce:transition-none",
            // Mobile: fixed overlay with translate (w-full always for mobile)
            "fixed top-14 left-0 z-45 h-[calc(100dvh-3.5rem)] w-full",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop: static flex item (collapse via width)
            "md:static md:z-auto md:flex md:h-auto md:translate-x-0",
            sidebarOpen
              ? "md:w-56 md:border-r md:opacity-100 md:shadow-lg"
              : "md:w-0 md:overflow-hidden md:border-r-0 md:p-0 md:opacity-0 md:shadow-none",
          )}
        >
          {/* Dismiss hint */}
          <div className="text-muted border-border flex items-center justify-center border-b px-3 py-2">
            <span className="text-[10px] font-medium tracking-wider uppercase opacity-60">
              {t.swipeLeftToClose}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <V1Nav onNav={close} />
          </div>

          {user ? (
            <div className="border-border border-t px-2 py-2">
              <ProfileSection user={user} logout={logout} />
            </div>
          ) : (
            <div className="border-border border-t px-4 py-3">
              <a
                href={LOGIN_PATH}
                className="bg-brand block rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white hover:opacity-90"
              >
                {t.signIn}
              </a>
            </div>
          )}
        </aside>

        {/* Main content — fills remaining width, no scroll at page level */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
          <section className="surface flex min-h-0 flex-1 flex-col gap-2 p-4 @sm:p-5">
            {children}
          </section>
        </div>
      </div>
    </div>
    </RealtimeProvider>
  );
}
