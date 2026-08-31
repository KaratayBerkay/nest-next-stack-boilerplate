"use client";

import { useRef, useCallback, useLayoutEffect, useState } from "react";

const IGNORE_SELECTOR =
  "button, a, input, textarea, label, select, [contenteditable]";

export function useYSwipeGesture<T extends HTMLElement>() {
  const elRef = useRef<T | null>(null);
  const [tick, setTick] = useState(0);
  const dragging = useRef(false);
  const startY = useRef(0);
  const scrollStart = useRef(0);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const isIgnored = (target: EventTarget | null): boolean => {
      const node = target as HTMLElement | null;
      if (!node) return true;
      const tag = node.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "BUTTON" ||
        tag === "A" ||
        tag === "LABEL" ||
        tag === "SELECT"
      )
        return true;
      return !!node.closest(IGNORE_SELECTOR);
    };

    // Gestures starting inside a nested horizontal scroller (e.g. a CSS
    // scroll-snap carousel) must stay native, or preventDefault() below
    // kills the swipe before the browser can scroll it.
    const inHorizontalScroller = (target: EventTarget | null): boolean => {
      let node = target instanceof HTMLElement ? target : null;
      while (node && node !== el) {
        if (node.scrollWidth > node.clientWidth) {
          const { overflowX } = getComputedStyle(node);
          if (overflowX === "auto" || overflowX === "scroll") return true;
        }
        node = node.parentElement;
      }
      return false;
    };

    // Same idea for a nested vertical scroller (e.g. an inner overflow-y-auto
    // list) — without this, dragging inside it hijacks the outer page's
    // scrollTop instead of the inner list's.
    const inVerticalScroller = (target: EventTarget | null): boolean => {
      let node = target instanceof HTMLElement ? target : null;
      while (node && node !== el) {
        if (node.scrollHeight > node.clientHeight) {
          const { overflowY } = getComputedStyle(node);
          if (overflowY === "auto" || overflowY === "scroll") return true;
        }
        node = node.parentElement;
      }
      return false;
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      if (
        !el ||
        isIgnored(e.target) ||
        inHorizontalScroller(e.target) ||
        inVerticalScroller(e.target)
      )
        return;
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
  }, [tick]);

  const setRef = useCallback((el: T | null) => {
    elRef.current = el;
    setTick((n) => n + 1);
  }, []);

  return setRef;
}
