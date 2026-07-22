"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { V1ShellProps } from "@/types/v1/V1Shell-types";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { RealtimeProvider } from "@/lib/realtime/RealtimeProvider";
import { useConversations } from "@/lib/realtime/useConversations";
import { useDeviceType } from "@/hooks";
import { useEdgeSwipe } from "@/hooks/useEdgeSwipe";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { V1Header } from "./V1Header";
import { V1Sidebar } from "./V1Sidebar";
import {
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} from "@/lib/v1/touch-handlers";
import { dragOnStart, dragOnMove, dragOnEnd } from "./V1ShellDrag";
import type { DragState } from "./V1ShellDrag";
import { onServiceWorkerMessage } from "./V1ShellSW";

export function V1Shell({ children }: V1ShellProps) {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "";
  const { user, token: _token, loading, logout } = useAuth();
  const t = useMessages("v1-shell");
  const { data: conversations = [] } = useConversations();
  const pointer = useDeviceType();
  const isTouch = pointer === "touch";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dragStateRef = useRef<DragState>({ dragging: false, startX: 0, currentX: 0 });

  const open = useCallback(() => setSidebarOpen(true), []);
  const close = useCallback(() => setSidebarOpen(false), []);
  const toggle = useCallback(() => setSidebarOpen((p) => !p), []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen, close]);

  useEdgeSwipe({
    onSwipeRight: open,
    onSwipeLeft: close,
    enabled: isTouch && !sidebarOpen,
  });

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const touchStart = (e: TouchEvent) =>
      handleTouchStart(e, (cx) => dragOnStart(cx, dragStateRef));
    const touchMove = (e: TouchEvent) =>
      handleTouchMove(e, (cx) => dragOnMove(cx, dragStateRef));
    const touchEnd = () =>
      handleTouchEnd(() => dragOnEnd(dragStateRef, close, toggleRef));
    const mouseDown = (e: MouseEvent) =>
      handleMouseDown(e, (cx) => dragOnStart(cx, dragStateRef));
    const mouseMove = (e: MouseEvent) =>
      handleMouseMove(e, (cx) => dragOnMove(cx, dragStateRef));
    const mouseUp = () =>
      handleMouseUp(() => dragOnEnd(dragStateRef, close, toggleRef));

    el.addEventListener("touchstart", touchStart, { passive: true });
    el.addEventListener("touchmove", touchMove, { passive: true });
    el.addEventListener("touchend", touchEnd);
    el.addEventListener("mousedown", mouseDown);
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);

    return () => {
      el.removeEventListener("touchstart", touchStart);
      el.removeEventListener("touchmove", touchMove);
      el.removeEventListener("touchend", touchEnd);
      el.removeEventListener("mousedown", mouseDown);
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    };
  }, [sidebarOpen, close]);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    const handler = (e: MessageEvent) => onServiceWorkerMessage(e, router);
    navigator.serviceWorker.addEventListener("message", handler);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handler);
    };
  }, [router]);

  return (
    <RealtimeProvider>
      <div className="flex h-dvh flex-col">
        <a
          href="#main-content"
          className="bg-brand text-brand-fg sr-only rounded-md px-3 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100]"
        >
          {t.skipToContent}
        </a>
        <V1Header
          toggle={toggle}
          open={open}
          loading={loading}
          user={user}
          logout={logout}
          lang={lang}
          conversations={conversations}
          sidebarOpen={sidebarOpen}
          toggleRef={toggleRef}
        />

        <div className="relative flex min-h-0 flex-1">
          {sidebarOpen && (
            <div
              className="animate-fade-in bg-overlay/30 fixed inset-0 z-30 md:hidden"
              onClick={() => {
                close();
                toggleRef.current?.focus();
              }}
              aria-hidden="true"
            />
          )}

          <V1Sidebar
            ref={sidebarRef}
            sidebarOpen={sidebarOpen}
            user={user}
            logout={logout}
            lang={lang}
            onNav={close}
          />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <main className="surface flex min-h-0 flex-1 flex-col overflow-y-auto p-4 @sm:p-5">
              {children}
            </main>
          </div>
        </div>
      </div>
    </RealtimeProvider>
  );
}
