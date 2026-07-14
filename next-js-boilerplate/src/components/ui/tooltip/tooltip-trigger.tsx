"use client";

import { cn } from "@/lib/cn";
import { useCallback, useRef } from "react";
import { useTooltip } from "./tooltip";
import type { TooltipTriggerProps } from "@/types/ui/Tooltip-types";

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
  const { show, hide, toggle, setTriggerRect, isDesktop, open, tooltipId } = useTooltip();

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isDesktop) {
          updateRect();
          toggle();
        }
      }
    },
    [updateRect, toggle, isDesktop],
  );

  // The wrapper span is deliberately passive (no role, no tabIndex): the
  // trigger is almost always a real button/link, and a focusable role="button"
  // wrapper around it is a nested-interactive violation. Focus/blur bubble up
  // from the child (React onFocus = focusin), so keyboard show/hide still
  // works. Wrapping plain text? Pass tabIndex={0} yourself.
  if (asChild) {
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- passive wrapper: events bubble from the interactive child; a focusable role="button" here is a nested-interactive violation
      <span
        ref={ref}
        className={cn("inline-flex", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-describedby={open ? tooltipId : undefined}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- passive wrapper: events bubble from the interactive child; a focusable role="button" here is a nested-interactive violation
    <span
      ref={ref}
      className={cn("inline-flex cursor-pointer", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-describedby={open ? tooltipId : undefined}
      {...props}
    >
      {children}
    </span>
  );
}
