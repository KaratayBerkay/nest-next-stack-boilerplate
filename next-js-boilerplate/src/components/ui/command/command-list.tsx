"use client";

import { cn } from "@/lib/cn";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBreakpoint, useDeviceType } from "@/hooks";
import { useCommandContext } from "./command";

const SCROLL_STEP = 40;
const SCROLL_REPEAT_MS = 60;

function ScrollChevron({
  direction,
  onScroll,
}: {
  direction: "up" | "down";
  onScroll: () => void;
}) {
  const repeatRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const onScrollRef = useRef(onScroll);
  useEffect(() => {
    onScrollRef.current = onScroll;
  });

  const start = () => {
    onScrollRef.current();
    repeatRef.current = setInterval(() => onScrollRef.current(), SCROLL_REPEAT_MS);
  };
  const stop = () => {
    if (repeatRef.current) clearInterval(repeatRef.current);
    repeatRef.current = undefined;
  };

  useEffect(() => stop, []);

  return (
    <div
      onMouseEnter={start}
      onMouseLeave={stop}
      className={cn(
        "bg-bg text-muted hover:text-fg absolute inset-x-0 z-10 flex h-8 items-center justify-center transition-colors",
        direction === "up" ? "top-0" : "bottom-0",
      )}
      aria-hidden="true"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={direction === "up" ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
      </svg>
    </div>
  );
}

export function CommandList({
  className,
  children,
  onKeyDown,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { filteredItems, selectedIndex, setSelectedIndex } =
    useCommandContext();
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  // Hover-repeat chevrons are a mouse affordance; touch already scrolls the
  // list natively. Same showChevrons reasoning as select-content.tsx.
  const isTouch = useDeviceType() === "touch";
  const isAboveBreakpoint = useBreakpoint("sm");
  const showChevrons = isAboveBreakpoint || !isTouch;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        let next = selectedIndex + 1;
        while (next < filteredItems.length && filteredItems[next].disabled) {
          next++;
        }
        if (next < filteredItems.length) setSelectedIndex(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        let prev = selectedIndex - 1;
        while (prev >= 0 && filteredItems[prev].disabled) {
          prev--;
        }
        if (prev >= 0) setSelectedIndex(prev);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item && !item.disabled) item.onSelect?.();
      }
    },
    [filteredItems, selectedIndex, setSelectedIndex],
  );

  const updateScrollButtons = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  // Observes the viewport (its own box can resize) and the list it wraps
  // (content height changes independently, e.g. options filtered in/out as
  // the user types) — a ResizeObserver on the viewport alone won't fire when
  // only its scrollHeight changes without its own box size changing.
  useEffect(() => {
    if (!showChevrons) return;
    updateScrollButtons();
    const targets = [viewportRef.current, listRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (targets.length === 0) return;
    const observer = new ResizeObserver(() => updateScrollButtons());
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [showChevrons, updateScrollButtons]);

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]');
    if (el) (el as HTMLElement).scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const scrollBy = (delta: number) => {
    viewportRef.current?.scrollBy({ top: delta });
    updateScrollButtons();
  };

  return (
    <div className="relative">
      {showChevrons && canScrollUp && (
        <ScrollChevron direction="up" onScroll={() => scrollBy(-SCROLL_STEP)} />
      )}
      <div
        ref={viewportRef}
        onScroll={updateScrollButtons}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented) handleKeyDown(e);
        }}
        tabIndex={-1}
        role="listbox"
        aria-label="Options"
        className={cn(
          "max-h-72 overflow-x-hidden overflow-y-auto",
          showChevrons && "scroll-py-8",
          className,
        )}
        {...props}
      >
        <div ref={listRef}>{children}</div>
      </div>
      {showChevrons && canScrollDown && (
        <ScrollChevron direction="down" onScroll={() => scrollBy(SCROLL_STEP)} />
      )}
    </div>
  );
}
