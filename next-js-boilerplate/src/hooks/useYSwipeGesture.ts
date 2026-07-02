"use client";

import { useRef, useCallback, useLayoutEffect } from "react";

const IGNORE_SELECTOR = "button, a, input, textarea, [contenteditable]";

export function useYSwipeGesture<T extends HTMLElement>(enabled = true) {
  const elRef = useRef<T | null>(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const scrollStart = useRef(0);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el || !enabled) return;

    const isIgnored = (target: EventTarget | null): boolean => {
      const node = target as HTMLElement | null;
      if (!node) return true;
      const tag = node.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "BUTTON" ||
        tag === "A"
      )
        return true;
      return !!node.closest(IGNORE_SELECTOR);
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = elRef.current;
      if (!target || isIgnored(e.target)) return;

      dragging.current = true;
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;
      startY.current = y;
      scrollStart.current = target.scrollTop;
      target.style.cursor = "grabbing";
      target.style.userSelect = "none";
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const target = elRef.current;
      if (!target) return;
      e.preventDefault();
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;
      target.scrollTop = scrollStart.current + (startY.current - y);
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      const target = elRef.current;
      if (!target) return;
      target.style.cursor = "";
      target.style.userSelect = "";
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [enabled]);

  const setRef = useCallback((el: T | null) => {
    elRef.current = el;
  }, []);

  return setRef;
}
