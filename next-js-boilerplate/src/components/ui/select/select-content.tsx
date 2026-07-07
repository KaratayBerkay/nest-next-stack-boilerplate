"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint } from "@/hooks";
import { useSelect } from "./select";

interface SelectContentProps extends React.ComponentPropsWithoutRef<"div"> {
  sideOffset?: number;
}

export function SelectContent({
  className,
  children,
  sideOffset = 8,
  ...props
}: SelectContentProps) {
  const { open, setOpen, triggerRef, contentRef } = useSelect();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const isDesktop = useBreakpoint("sm");

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

  useEffect(() => {
    if (!open || !isDesktop || !contentRef.current) return;
    const items = contentRef.current.querySelectorAll('[role="option"]');
    if (items.length > 0) {
      const selected = contentRef.current.querySelector(
        '[aria-selected="true"]',
      );
      ((selected ?? items[0]) as HTMLElement).focus();
    }
  }, [open, isDesktop, contentRef]);

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

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen, triggerRef]);

  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    const items = contentRef.current?.querySelectorAll('[role="option"]');
    if (!items || items.length === 0) return;

    const currentIndex = Array.from(items).findIndex(
      (item) => item === document.activeElement,
    );

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        (items[next] as HTMLButtonElement).focus();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        (items[prev] as HTMLButtonElement).focus();
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (currentIndex >= 0) {
          (items[currentIndex] as HTMLButtonElement).click();
        }
        break;
      }
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      {!isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        ref={contentRef}
        role="listbox"
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
          isDesktop
            ? "border-border bg-bg animate-fade-in-down z-50 max-h-60 min-w-[8rem] origin-top-right overflow-y-auto rounded-lg border p-1 shadow-lg"
            : "bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4",
          className,
        )}
        onKeyDown={handleContentKeyDown}
        {...props}
      >
        {!isDesktop && (
          <div className="flex items-center justify-between pb-3">
            <span className="text-sm font-semibold">Select</span>
            <button
              onClick={() => setOpen(false)}
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
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
