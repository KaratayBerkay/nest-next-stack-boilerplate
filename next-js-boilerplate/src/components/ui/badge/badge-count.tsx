"use client";

import { cn } from "@/lib/cn";
import type { BadgeCountProps, BadgeCountDirection } from "@/types/ui/BadgeCount-types";

const directionStyles: Record<BadgeCountDirection, string> = {
  "left-top": "-top-2 -left-2",
  "left-bottom": "-bottom-2 -left-2",
  "right-top": "-top-2 -right-2",
  "right-bottom": "-bottom-2 -right-2",
  "middle-top": "-top-2 left-1/2 -translate-x-1/2",
  "middle-bottom": "-bottom-2 left-1/2 -translate-x-1/2",
};

function formatCount(count: number | string, max: number): string {
  if (typeof count === "string") return count;
  if (count > max) return `${max}+`;
  return String(count);
}

function ruleStyles(rule: string, hasCount: boolean): string {
  switch (rule) {
    case "positive":
      return "bg-success text-success-fg";
    case "negative":
      return "bg-error text-error-fg";
    case "icon":
      return hasCount
        ? "bg-error text-error-fg"
        : "bg-border text-muted";
    case "string":
    default:
      return "bg-brand text-brand-fg";
  }
}

export function BadgeCount({
  direction = "right-top",
  count,
  rule = "negative",
  max = 99,
  showZero = false,
  dot = false,
  children,
  className,
  ...props
}: BadgeCountProps) {
  const displayCount = formatCount(count, max);
  const hasCount = typeof count === "string" ? count.length > 0 : count > 0;
  const shouldShow = dot || hasCount || showZero;

  return (
    <span className={cn("relative inline-flex", className)} {...props}>
      {children}
      {shouldShow && (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full border-2 border-bg px-1 text-[10px] font-bold leading-none",
            directionStyles[direction],
            ruleStyles(rule, hasCount),
            dot && "size-2.5 px-0",
          )}
        >
          {!dot && displayCount}
        </span>
      )}
    </span>
  );
}
