"use client";

import { useEffect, useRef } from "react";

/**
 * Attach to a horizontally scrollable container to get the app's edge-fade
 * scroll hint (scrollbars are hidden globally). Toggles `.scroll-fade-x`
 * plus `.scrolled-to-left/right` from globals.css directly on the element —
 * fades only appear while there is actually more content to scroll to.
 */
export function useScrollFadeX<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const scrollable = el.scrollWidth - el.clientWidth > 1;
      const atLeft = el.scrollLeft <= 1;
      const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      el.classList.toggle("scroll-fade-x", scrollable);
      el.classList.toggle("scrolled-to-left", !scrollable || atLeft);
      el.classList.toggle("scrolled-to-right", !scrollable || atRight);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  return ref;
}
