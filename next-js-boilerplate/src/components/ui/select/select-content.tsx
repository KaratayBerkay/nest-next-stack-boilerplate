"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint } from "@/hooks";
import { bottomSheetClasses, BottomSheetHandle } from "@/components/ui/bottom-sheet";
import { useSelect } from "./select";
import type { SelectContentProps } from "@/types/ui/Select-types";

const ENABLED_OPTION_SELECTOR = '[role="option"]:not([data-disabled])';

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
    item.focus();
    item.scrollIntoView({ block: "nearest" });
  }, []);

  useEffect(() => {
    if (!open || !isDesktop || !contentRef.current) return;
    const items = contentRef.current.querySelectorAll(ENABLED_OPTION_SELECTOR);
    if (items.length > 0) {
      const selected = contentRef.current.querySelector(
        '[aria-selected="true"]:not([data-disabled])',
      );
      focusItem((selected ?? items[0]) as HTMLElement);
    }
  }, [open, isDesktop, contentRef, focusItem]);

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
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented) handleKeyDown(e);
        }}
        style={
          isDesktop && position
            ? {
                position: "fixed",
                top: position.top,
                left: position.left,
                width: position.width,
              }
            : undefined
        }
        className={cn(
          "border-border bg-bg text-fg",
          isDesktop
            ? "z-50 max-h-60 min-w-[8rem] origin-top-right overflow-y-auto rounded-lg border p-1 shadow-lg"
            : bottomSheetClasses,
          className,
        )}
        {...props}
      >
        {!isDesktop && <BottomSheetHandle />}
        <div
          className={cn(
            isDesktop ? "" : "flex flex-1 flex-col gap-0.5 overflow-y-auto",
          )}
        >
          <div className="pointer-events-auto">{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}
