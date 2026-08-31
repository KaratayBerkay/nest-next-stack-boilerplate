"use client";

import { useEffect, useRef, type RefObject } from "react";
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

export function useSidebarEscape(
  open: boolean,
  close: () => void,
  toggleRef: RefObject<HTMLButtonElement | null>,
): void {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close, toggleRef]);
}

export function useSidebarDrag(
  sidebarRef: RefObject<HTMLElement | null>,
  open: boolean,
  close: () => void,
  toggleRef: RefObject<HTMLButtonElement | null>,
): void {
  const dragStateRef = useRef<DragState>({
    dragging: false,
    startX: 0,
    currentX: 0,
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
  }, [sidebarRef, open, close, toggleRef]);
}
