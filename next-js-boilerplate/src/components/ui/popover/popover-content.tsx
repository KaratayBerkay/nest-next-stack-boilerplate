"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBreakpoint } from "@/hooks";
import { bottomSheetClasses, BottomSheetHandle } from "@/components/ui/bottom-sheet";
import { usePopover } from "./popover";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { PopoverContentProps as PopoverContentPropsOriginal } from "@/types/ui/Popover-types";

type PopoverContentProps = Omit<PopoverContentPropsOriginal, "variant"> & { variant?: string };

const popoverVariants = {
  ...globalStyleVariants,
  default: "bg-bg text-fg border-border",
};

export function PopoverContent({
  className,
  children,
  align = "start",
  sideOffset = 8,
  initialFocus,
  title,
  variant,
  ...props
}: PopoverContentProps & { variant?: string }) {
  const effectiveVariant = useComponentVariant(variant);
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
      const contentHeight = contentRef.current?.offsetHeight ?? 0;

      let left: number;
      if (align === "end") {
        left = Math.max(8, triggerRect.right - contentWidth);
      } else {
        left = Math.max(8, triggerRect.left);
      }
      left = Math.min(left, window.innerWidth - contentWidth - 8);

      let top: number;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      if (contentHeight > spaceBelow && triggerRect.top > contentHeight) {
        top = triggerRect.top - contentHeight - sideOffset;
      } else {
        top = triggerRect.bottom + sideOffset;
      }

      setPosition({ top, left });
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
    if (!open || !contentRef.current) return;
    const target = initialFocus?.current ?? contentRef.current;
    target.focus();
  }, [open, initialFocus]);

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
        aria-label={title ?? "Popover"}
        tabIndex={-1}
        style={
          isDesktop && position
            ? { position: "fixed", top: position.top, left: position.left }
            : undefined
        }
        className={cn(
          isDesktop
            ? "z-50 min-w-[8rem] origin-top-right rounded-lg border p-4 shadow-lg animate-scale-in"
            : bottomSheetClasses,
          resolveVariant(popoverVariants, effectiveVariant),
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
