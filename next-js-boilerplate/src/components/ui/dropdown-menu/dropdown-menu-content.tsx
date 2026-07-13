"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint } from "@/hooks";
import { useDropdownMenuContext } from "./dropdown-menu";
import type { DropdownMenuContentProps, DropdownMenuVariant } from "@/types/ui/DropdownMenu-types";

const variants: Record<DropdownMenuVariant, string> = {
  default: "bg-bg border-border text-fg",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950 text-white border-transparent shadow-2xl",
  glass: "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl",
  neon: "bg-slate-950/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text border-transparent shadow-2xl",
};

export function DropdownMenuContent({
  className,
  children,
  variant = "default",
  ...props
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef, variant: contextVariant } = useDropdownMenuContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isDesktop = useBreakpoint("sm");
  const variantClass = variants[variant || contextVariant || "default"];

  useEffect(() => {
    if (open && triggerRef.current && isDesktop) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [open, triggerRef, isDesktop]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen, triggerRef]);

  useEffect(() => {
    if (open) {
      const handleKeyDown = (e: KeyboardEvent) => {
        const items = contentRef.current?.querySelectorAll<HTMLDivElement>(
          '[role="menuitem"]:not([data-disabled])',
        );
        if (!items?.length) return;

        const currentIndex = Array.from(items).findIndex(
          (item) => item === document.activeElement,
        );

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex]?.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex]?.focus();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  useEffect(() => {
    if (open && contentRef.current && isDesktop) {
      const firstItem = contentRef.current.querySelector<HTMLDivElement>(
        '[role="menuitem"]:not([data-disabled])',
      );
      firstItem?.focus();
    }
  }, [open, isDesktop]);

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
        role="menu"
        data-state="open"
        style={
          isDesktop && position
            ? { position: "fixed", top: position.top, left: position.left }
            : undefined
        }
        className={cn(
          isDesktop
            ? "z-50 min-w-44 origin-top-right rounded-xl border p-1 shadow-lg"
            : "bg-bg animate-fade-in fixed inset-0 z-50 flex flex-col p-4",
          variantClass,
          className,
        )}
        {...props}
      >
        {!isDesktop && (
          <div className="flex items-center justify-between pb-3">
            <span className="text-sm font-semibold">Menu</span>
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
