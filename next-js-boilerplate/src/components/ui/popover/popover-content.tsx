"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint } from "@/hooks";
import { usePopover } from "./popover";
import type { PopoverContentProps } from "@/types/ui/Popover-types";

export function PopoverContent({
  className,
  children,
  align = "start",
  sideOffset = 8,
  ...props
}: PopoverContentProps) {
  const { open, close, triggerRef, contentId } = usePopover();
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const isDesktop = useBreakpoint("sm");

  useEffect(() => {
    if (!open || !triggerRef.current || !isDesktop) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const contentWidth = contentRef.current?.offsetWidth ?? 0;
      let left: number;

      if (align === "end") {
        left = Math.max(8, triggerRect.right - contentWidth);
      } else {
        left = Math.max(8, triggerRect.left);
      }

      setPosition({
        top: triggerRect.bottom + sideOffset,
        left,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align, sideOffset, triggerRef, isDesktop]);

  useEffect(() => {
    if (!open || !isDesktop) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open, close, triggerRef, isDesktop]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close, triggerRef]);

  useEffect(() => {
    if (!open || !isDesktop || !contentRef.current) return;
    contentRef.current.focus();
  }, [open, isDesktop]);

  if (!open) return null;

  return createPortal(
    <>
      {!isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-overlay/50"
          onClick={close}
          aria-hidden="true"
        />
      )}
      <div
        ref={contentRef}
        id={contentId}
        role="dialog"
        aria-label="Popover"
        tabIndex={-1}
        style={
          isDesktop && position
            ? { position: "fixed", top: position.top, left: position.left }
            : undefined
        }
        className={cn(
          isDesktop
            ? "z-50 min-w-[8rem] origin-top-right rounded-lg border p-4 shadow-lg"
            : "bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4",
          className,
        )}
        {...props}
      >
        {!isDesktop && (
          <div className="flex items-center justify-between pb-3">
            <span className="text-sm font-semibold">Menu</span>
            <button
              onClick={close}
              className="text-muted hover:bg-surface-hover rounded-lg p-1"
              aria-label="Close menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
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
