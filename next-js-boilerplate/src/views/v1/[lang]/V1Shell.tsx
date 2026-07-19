"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { Dispatch, SetStateAction, MutableRefObject } from "react";
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
  handleServiceWorkerMessage,
} from "@/lib/v1/touch-handlers";

interface DragState {
  dragging: boolean;
  startX: number;
  currentX: number;
}

function openSidebar(setSidebarOpen: Dispatch<SetStateAction<boolean>>) {
  setSidebarOpen(true);
}

function closeSidebar(setSidebarOpen: Dispatch<SetStateAction<boolean>>) {
  setSidebarOpen(false);
}

function toggleSidebar(setSidebarOpen: Dispatch<SetStateAction<boolean>>) {
  setSidebarOpen((p) => !p);
}

function dragOnStart(
  clientX: number,
  dragStateRef: MutableRefObject<DragState>,
) {
  dragStateRef.current = { dragging: true, startX: clientX, currentX: clientX };
}

function dragOnMove(
  clientX: number,
  dragStateRef: MutableRefObject<DragState>,
) {
  if (!dragStateRef.current.dragging) return;
  dragStateRef.current.currentX = clientX;
}

function dragOnEnd(
  dragStateRef: MutableRefObject<DragState>,
  close: () => void,
) {
  if (!dragStateRef.current.dragging) return;
  const dx = dragStateRef.current.currentX - dragStateRef.current.startX;
  dragStateRef.current.dragging = false;
  if (dx < -50) close();
}

function onServiceWorkerMessage(
  e: MessageEvent,
  router: ReturnType<typeof useRouter>,
) {
  handleServiceWorkerMessage(e, router);
}

export function V1Shell({ children }: V1ShellProps) {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "";
  const { user, token: _token, loading, logout } = useAuth();
  const _t = useMessages("v1-shell");
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

  const open = useCallback(() => openSidebar(setSidebarOpen), []);
  const close = useCallback(() => closeSidebar(setSidebarOpen), []);
  const toggle = useCallback(() => toggleSidebar(setSidebarOpen), []);

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
    const touchEnd = () => handleTouchEnd(() => dragOnEnd(dragStateRef, close));
    const mouseDown = (e: MouseEvent) =>
      handleMouseDown(e, (cx) => dragOnStart(cx, dragStateRef));
    const mouseMove = (e: MouseEvent) =>
      handleMouseMove(e, (cx) => dragOnMove(cx, dragStateRef));
    const mouseUp = () => handleMouseUp(() => dragOnEnd(dragStateRef, close));

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
        <V1Header
          toggle={toggle}
          open={open}
          loading={loading}
          user={user}
          logout={logout}
          lang={lang}
          conversations={conversations}
        />

        <div className="relative flex min-h-0 flex-1">
          {sidebarOpen && (
            // Decorative dismiss backdrop, not a control — the sidebar's own controls remain
            // keyboard-reachable; this scrim only needs a click target.
            <div
              className="animate-fade-in fixed inset-0 z-30 bg-overlay/30 md:hidden"
              onClick={close}
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

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
            <section className="surface flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 @sm:p-5">
              {children}
            </section>
          </div>
        </div>
      </div>
    </RealtimeProvider>
  );
}
