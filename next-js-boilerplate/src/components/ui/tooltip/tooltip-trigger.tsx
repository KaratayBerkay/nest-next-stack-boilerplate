"use client";

import { cn } from "@/lib/cn";
import { useCallback, useRef } from "react";
import { useTooltip } from "./tooltip";
import type { TooltipTriggerProps } from "@/types/ui/TooltipTrigger-types";

export function TooltipTrigger({
  asChild,
  children,
  className,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onClick,
  ...props
}: TooltipTriggerProps) {
  const ref = useRef<HTMLElement>(null);
  const { show, hide, toggle, setTriggerRect, isDesktop } = useTooltip();

  const updateRect = useCallback(() => {
    if (ref.current) {
      setTriggerRect(ref.current.getBoundingClientRect());
    }
  }, [setTriggerRect]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!isDesktop) return;
      updateRect();
      show();
      onMouseEnter?.(e);
    },
    [updateRect, show, onMouseEnter, isDesktop],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!isDesktop) return;
      hide();
      onMouseLeave?.(e);
    },
    [hide, onMouseLeave, isDesktop],
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLSpanElement>) => {
      if (!isDesktop) return;
      updateRect();
      show();
      onFocus?.(e);
    },
    [updateRect, show, onFocus, isDesktop],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLSpanElement>) => {
      if (!isDesktop) return;
      hide();
      onBlur?.(e);
    },
    [hide, onBlur, isDesktop],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!isDesktop) {
        updateRect();
        toggle();
      }
      onClick?.(e);
    },
    [updateRect, toggle, onClick, isDesktop],
  );

  if (asChild) {
    return (
      <span
        ref={ref}
        className={cn("inline-flex", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={cn("inline-flex cursor-pointer", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      {...props}
    >
      {children}
    </span>
  );
}
