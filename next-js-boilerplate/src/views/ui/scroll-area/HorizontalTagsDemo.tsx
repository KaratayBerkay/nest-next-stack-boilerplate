"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { cn } from "@/lib/cn";

const TAGS = [
  "React",
  "TypeScript",
  "Tailwind",
  "Next.js",
  "Radix UI",
  "Zustand",
  "React Query",
  "Vitest",
  "Playwright",
  "Storybook",
  "tRPC",
  "Prisma",
  "Docker",
  "ESLint",
  "Prettier",
];

function setupXPanGesture(el: HTMLElement): () => void {
  let dragging = false;
  let startX = 0;
  let scrollStart = 0;

  const onDown = (e: MouseEvent | TouchEvent) => {
    if (dragging) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, [contenteditable]"))
      return;
    if ("touches" in e) e.preventDefault();

    dragging = true;
    const x = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    startX = x;
    scrollStart = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const x = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    el.scrollLeft = scrollStart + (startX - x);
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
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
}

function useScrollFadeX<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [scrollPos, setScrollPos] = useState<"start" | "end" | "middle">(
    "start",
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const atStart = el.scrollLeft <= 2;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      if (atStart) setScrollPos("start");
      else if (atEnd) setScrollPos("end");
      else setScrollPos("middle");
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const setRef = useCallback((el: T | null) => {
    ref.current = el;
    if (el) setupXPanGesture(el);
  }, []);

  return { setRef, scrollPos };
}

export function HorizontalTagsDemo() {
  const { setRef: xPanRef, scrollPos } = useScrollFadeX<HTMLDivElement>();

  return (
    <div
      ref={xPanRef}
      role="region"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- axe scrollable-region-focusable: keyboard users must be able to scroll this pane
      tabIndex={0}
      aria-label="Tag strip"
      className={cn(
        "scroll-fade-x border-border flex h-14 cursor-grab items-center gap-2 overflow-x-auto rounded-lg border px-3",
        scrollPos === "start" && "scrolled-to-left",
        scrollPos === "end" && "scrolled-to-right",
      )}
    >
      {TAGS.map((tag) => (
        <span
          key={tag}
          className="bg-surface-hover text-fg hover:bg-surface shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
