"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint } from "@/hooks";
import { bottomSheetClasses, BottomSheetHandle } from "@/components/ui/bottom-sheet";
import { useDropdownMenuContext } from "./dropdown-menu";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants, type GlobalVariant } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { DropdownMenuContentProps } from "@/types/ui/DropdownMenu-types";

const dropdownVariants = {
  ...globalStyleVariants,
  default: "bg-bg border-border text-fg",
};

export function DropdownMenuContent({
  className,
  children,
  onKeyDown,
  variant,
  ...props
}: DropdownMenuContentProps & { variant?: GlobalVariant }) {
  const effectiveVariant = useComponentVariant(variant);
  const { open, setOpen, triggerRef } = useDropdownMenuContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isDesktop = useBreakpoint("sm");

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
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, setOpen, triggerRef]);

  useEffect(() => {
    if (open && contentRef.current && isDesktop) {
      const firstItem = contentRef.current.querySelector<HTMLDivElement>(
        '[role="menuitem"]:not([data-disabled])',
      );
      firstItem?.focus({ preventScroll: true });
    }
  }, [open, isDesktop]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

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
        role="menu"
        data-state="open"
        tabIndex={-1}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented) handleKeyDown(e);
        }}
        style={
          isDesktop && position
            ? { position: "fixed", top: position.top, left: position.left }
            : undefined
        }
        className={cn(
          isDesktop
            ? cn(
                "z-50 min-w-44 origin-top-right rounded-xl border p-1 shadow-lg",
                className,
              )
            : bottomSheetClasses,
          resolveVariant(dropdownVariants, effectiveVariant),
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
