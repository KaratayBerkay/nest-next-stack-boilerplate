"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint } from "@/hooks";
import { bottomSheetClasses, BottomSheetHandle } from "@/components/ui/bottom-sheet";
import { useSelect } from "./select";
import type { SelectContentProps } from "@/types/ui/Select-types";

const ENABLED_OPTION_SELECTOR = '[role="option"]:not([data-disabled])';
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

  const start = () => {
    onScroll();
    repeatRef.current = setInterval(onScroll, SCROLL_REPEAT_MS);
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
        "bg-bg text-muted hover:text-fg sticky z-10 flex h-8 w-full items-center justify-center transition-colors",
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

export function SelectContent({
  className,
  children,
  sideOffset = 8,
  onKeyDown,
  ...props
}: SelectContentProps) {
  const { open, setOpen, triggerRef, contentRef } = useSelect();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const isDesktop = useBreakpoint("sm");
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, [contentRef]);

  useEffect(() => {
    if (!open || !isDesktop) return;
    const raf = requestAnimationFrame(updateScrollButtons);
    return () => cancelAnimationFrame(raf);
  }, [open, isDesktop, updateScrollButtons]);

  useEffect(() => {
    return () => {
      if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open || !triggerRef.current || !isDesktop) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      setPosition({
        top: triggerRect.bottom + sideOffset,
        left: triggerRect.left,
        width: triggerRect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, sideOffset, triggerRef, isDesktop]);

  const focusItem = useCallback((item: HTMLElement) => {
    item.focus({ preventScroll: true });
    item.scrollIntoView({ block: "nearest" });
  }, []);

  useEffect(() => {
    // Gated on `position` (not just `open`): before it's computed, the panel
    // has no fixed coordinates yet, and scrollIntoView on a descendant would
    // scroll the whole page instead of the list — corrupting every other
    // fixed-position panel on screen that recomputes on window scroll.
    if (!open || !isDesktop || !position || !contentRef.current) return;
    const items = contentRef.current.querySelectorAll(ENABLED_OPTION_SELECTOR);
    if (items.length > 0) {
      const selected = contentRef.current.querySelector(
        '[aria-selected="true"]:not([data-disabled])',
      );
      focusItem((selected ?? items[0]) as HTMLElement);
    }
  }, [open, isDesktop, position, contentRef, focusItem]);

  useEffect(() => {
    if (!open || !isDesktop) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open, setOpen, triggerRef, contentRef, isDesktop]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (!contentRef.current) return;
    const items = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(ENABLED_OPTION_SELECTOR),
    );
    if (!items.length) return;

    const currentIndex = items.findIndex(
      (el) => el === document.activeElement,
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      focusItem(items[next]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      focusItem(items[prev]);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(items[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(items[items.length - 1]);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
      typeaheadRef.current += e.key.toLowerCase();
      const match = items.find((el) =>
        el.textContent?.toLowerCase().startsWith(typeaheadRef.current),
      );
      if (match) focusItem(match);
      typeaheadTimerRef.current = setTimeout(() => {
        typeaheadRef.current = "";
      }, 500);
    }
  };

  const scrollBy = (delta: number) => {
    contentRef.current?.scrollBy({ top: delta });
    updateScrollButtons();
  };

  if (!open) return null;

  return createPortal(
    <>
      {!isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-overlay/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        ref={contentRef}
        role="listbox"
        tabIndex={-1}
        data-portal-layer=""
        onScroll={isDesktop ? updateScrollButtons : undefined}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented) handleKeyDown(e);
        }}
        style={
          isDesktop && position
            ? { top: position.top, left: position.left, width: position.width }
            : undefined
        }
        className={cn(
          "border-border bg-bg text-fg",
          isDesktop
            ? cn(
                // `fixed` from the very first paint (not only once `position`
                // is known) — otherwise the panel briefly sits in normal
                // document flow at the end of <body>, and any scrollIntoView
                // on a descendant during that frame scrolls the whole page.
                "fixed z-50 max-h-60 min-w-[8rem] origin-top-right overflow-y-auto rounded-lg border p-1 shadow-lg",
                !position && "invisible",
                className,
              )
            : bottomSheetClasses,
        )}
        {...props}
      >
        {!isDesktop && <BottomSheetHandle />}
        {isDesktop && canScrollUp && (
          <ScrollChevron direction="up" onScroll={() => scrollBy(-SCROLL_STEP)} />
        )}
        <div
          className={cn(
            isDesktop ? "" : "flex flex-1 flex-col gap-0.5 overflow-y-auto",
          )}
        >
          <div className="pointer-events-auto">{children}</div>
        </div>
        {isDesktop && canScrollDown && (
          <ScrollChevron direction="down" onScroll={() => scrollBy(SCROLL_STEP)} />
        )}
      </div>
    </>,
    document.body,
  );
}
