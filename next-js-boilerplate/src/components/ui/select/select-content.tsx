"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint, useDeviceType } from "@/hooks";
import { bottomSheetShellClasses, BottomSheetHandle } from "@/components/ui/bottom-sheet";
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

export function SelectContent({
  className,
  children,
  sideOffset = 8,
  onKeyDown,
  forceBottomSheet,
  ...props
}: SelectContentProps) {
  const { open, setOpen, triggerRef, contentRef } = useSelect();
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Hook always runs (rules of hooks); forceBottomSheet just overrides the
  // result so callers like Calendar's month/year dropdowns can opt into the
  // bottom sheet at every width without changing the breakpoint for every
  // other select in the app.
  const isAboveBreakpoint = useBreakpoint("sm");
  const isDesktop = forceBottomSheet ? false : isAboveBreakpoint;
  // Scroll chevrons are a mouse/keyboard affordance, not a layout one: shown
  // whenever the current input isn't touch, regardless of whether we're in
  // the desktop popup or the (possibly forced) bottom sheet — a touch user
  // can already drag-scroll natively, and on a touch device wide enough to
  // hit the desktop popup layout the same applies there too.
  const isTouch = useDeviceType() === "touch";
  // `pointer: coarse` vs `pointer: fine` is ambiguous on touchscreen laptops
  // — a device can report a coarse *primary* pointer while a mouse is what's
  // actually driving the page, which would wrongly suppress chevrons for a
  // desktop user. `isAboveBreakpoint` is the same width-based signal every
  // other overlay in this file already trusts (see isDesktop above); "wide
  // viewport" is a much more reliable stand-in for "not a phone" than
  // pointer-capability media queries, so it's used to force chevrons on even
  // if the touch heuristic misfires. Only a narrow *and* touch-primary
  // device suppresses them.
  const showChevrons = isAboveBreakpoint || !isTouch;
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // Measured on the scrolling viewport alone, not the panel that also hosts
  // the overlay chevrons — otherwise a chevron mounting changes scrollHeight,
  // which flips canScrollDown back off, unmounting it again: an infinite
  // flicker right at the end of the list.
  const updateScrollButtons = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    if (!open || !showChevrons) return;
    // A single point-in-time check (the previous approach: one
    // requestAnimationFrame right after open) can under-report if the list's
    // true size settles after that frame — e.g. option labels affecting
    // layout, or this select rendering inside another animating panel (the
    // DatePicker's own slide-up bottom sheet). A ResizeObserver on both the
    // viewport (its own box can change, e.g. on window resize) and the list
    // it wraps (content height can change independently of the viewport's
    // box) keeps canScrollUp/canScrollDown correct for the panel's actual
    // lifetime, not just its first frame.
    updateScrollButtons();
    const targets = [viewportRef.current, listRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (targets.length === 0) return;
    const observer = new ResizeObserver(() => updateScrollButtons());
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [open, showChevrons, updateScrollButtons]);

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

  // Whether a position has been computed at least once — not the `position`
  // object itself, which gets a new reference on every recompute. The window
  // scroll listener above is capture-phase, so it also fires for the list's
  // own internal scrolling (descendant scroll events are still caught during
  // capture even though `scroll` doesn't bubble). Keying the effect below off
  // the object would re-run it, and thus re-run scrollIntoView, on every
  // scroll tick of the list — yanking the selected item back into view and
  // fighting the user's own scroll. Short lists (e.g. months) mask this
  // because the selection usually stays in view anyway; long lists (years)
  // don't, which is why only those visibly bounce/flash.
  const isPositioned = position !== null;

  useEffect(() => {
    // Mirrors showChevrons (not just touch), same reasoning: skips only when
    // chevrons themselves are hidden (unchanged from before for a genuine
    // touch+narrow device: no auto-focus in that bottom sheet, same as it's
    // always been) — fires for both the desktop popup and a forced bottom
    // sheet whenever we're showing scroll assistance there. For the desktop
    // popup, still gated on `isPositioned` (not just `open`): before a
    // position exists, the panel has no fixed coordinates yet, and
    // scrollIntoView on a descendant would scroll the whole page instead of
    // the list — corrupting every other fixed-position panel on screen that
    // recomputes on window scroll.
    if (!open || !showChevrons || (isDesktop && !isPositioned) || !contentRef.current) return;
    const items = contentRef.current.querySelectorAll(ENABLED_OPTION_SELECTOR);
    if (items.length > 0) {
      const selected = contentRef.current.querySelector(
        '[aria-selected="true"]:not([data-disabled])',
      );
      focusItem((selected ?? items[0]) as HTMLElement);
      // Belt-and-suspenders alongside the ResizeObserver above: scrollIntoView
      // does dispatch a native `scroll` event, which the viewport's onScroll
      // already picks up, but that's one more link in the chain than a
      // direct call needs — no reason to depend on it firing before paint.
      updateScrollButtons();
    }
  }, [open, isDesktop, showChevrons, isPositioned, contentRef, focusItem, updateScrollButtons]);

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
    viewportRef.current?.scrollBy({ top: delta });
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
        // Inspectable in devtools without needing to reproduce this in a
        // dev environment: if chevrons are ever missing again, check these
        // first before assuming a deploy/cache problem.
        data-pointer-type={isTouch ? "touch" : "not-touch"}
        data-show-chevrons={showChevrons}
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
                // Scrolling lives on the inner viewport below; `overflow-hidden`
                // here just clips the overlay chevrons to the rounded corners.
                "fixed z-50 min-w-[8rem] origin-top-right overflow-hidden rounded-lg border shadow-lg",
                !position && "invisible",
                className,
              )
            : bottomSheetShellClasses,
        )}
        {...props}
      >
        {!isDesktop && <BottomSheetHandle />}
        {isDesktop ? (
          <div className="relative">
            {showChevrons && canScrollUp && (
              <ScrollChevron direction="up" onScroll={() => scrollBy(-SCROLL_STEP)} />
            )}
            <div
              ref={viewportRef}
              onScroll={updateScrollButtons}
              className={cn("max-h-60 overflow-y-auto p-1", showChevrons && "scroll-py-8")}
            >
              <div ref={listRef} className="pointer-events-auto">{children}</div>
            </div>
            {showChevrons && canScrollDown && (
              <ScrollChevron direction="down" onScroll={() => scrollBy(SCROLL_STEP)} />
            )}
          </div>
        ) : (
          // Unlike the desktop popup above, the scrolling element here *is*
          // the relative anchor for the chevrons (rather than a separate
          // wrapper around it) — a `position: absolute` child never
          // contributes to its ancestor's scrollHeight the way the original
          // `position: sticky` chevrons did, so this doesn't reintroduce that
          // bug. It's necessary here, not just a simplification: the wrapper
          // needed for the desktop layout's fixed `max-h-60` doesn't have a
          // fixed pixel height to give a wrapper here — this panel's usable
          // height is "whatever's left after the handle, up to max-h-[85vh]"
          // — and `height: 100%` on a separate inner div does not reliably
          // resolve against a `flex: 1` ancestor's computed height in the
          // way the shell's overflow-hidden clipping needs it to (confirmed
          // empirically: the inner div silently grew to its full content
          // height instead of respecting the flex parent's size). Making the
          // scrolling element itself the flex-1 child sidesteps the
          // percentage-height resolution entirely.
          <div
            ref={viewportRef}
            onScroll={updateScrollButtons}
            className={cn(
              "relative min-h-0 flex-1 overflow-y-auto",
              showChevrons && "scroll-py-8",
            )}
          >
            {showChevrons && canScrollUp && (
              <ScrollChevron direction="up" onScroll={() => scrollBy(-SCROLL_STEP)} />
            )}
            <div ref={listRef} className="pointer-events-auto flex flex-col gap-0.5">{children}</div>
            {showChevrons && canScrollDown && (
              <ScrollChevron direction="down" onScroll={() => scrollBy(SCROLL_STEP)} />
            )}
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
