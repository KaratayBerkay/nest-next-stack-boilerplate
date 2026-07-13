"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint } from "@/hooks";
import { useSelect } from "./select";
import type { SelectContentProps, SelectVariant } from "@/types/ui/Select-types";

const variants: Record<SelectVariant, string> = {
  default: "border-border bg-bg text-fg",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950 text-white border-transparent shadow-2xl",
  glass: "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl",
  neon: "bg-slate-950/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text border-transparent shadow-2xl",
};

export function SelectContent({
  className,
  children,
  sideOffset = 8,
  ...props
}: SelectContentProps) {
  const { open, setOpen, triggerRef, contentRef, variant } = useSelect();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const isDesktop = useBreakpoint("sm");
  const variantClass = variants[variant || "default"];

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

  if (!open) return null;

  return createPortal(
    <>
      {!isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
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
            ? "z-50 max-h-60 min-w-[8rem] origin-top-right overflow-y-auto rounded-lg border p-1 shadow-lg"
            : "bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4",
          variantClass,
          className,
        )}
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
          <div className="pointer-events-auto">{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}
