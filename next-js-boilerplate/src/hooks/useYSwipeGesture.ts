"use client";

import { useRef, useCallback, useLayoutEffect, useState } from "react";

const IGNORE_SELECTOR = "button, a, input, textarea, [contenteditable]";

export function useYSwipeGesture<T extends HTMLElement>(enabled = true) {
  const elRef = useRef<T | null>(null);
  const [tick, setTick] = useState(0);
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
      if (!el || isIgnored(e.target)) return;
      if ("touches" in e) e.preventDefault();

      dragging.current = true;
      const y = "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
      startY.current = y;
      scrollStart.current = el.scrollTop;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current || !el) return;
      e.preventDefault();
      const y = "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
      el.scrollTop = scrollStart.current + (startY.current - y);
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      if (!el) return;
      el.style.cursor = "";
      el.style.userSelect = "";
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("touchstart", onDown, { passive: false });
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
  }, [enabled, tick]);

  const setRef = useCallback((el: T | null) => {
    elRef.current = el;
    setTick((n) => n + 1);
  }, []);

  return setRef;
}
