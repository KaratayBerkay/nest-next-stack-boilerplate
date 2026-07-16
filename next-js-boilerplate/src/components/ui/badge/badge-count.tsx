"use client";

import { cn } from "@/lib/cn";
import type { BadgeCountProps, BadgeCountDirection } from "@/types/ui/BadgeCount-types";

const directionStyles: Record<BadgeCountDirection, string> = {
  "left-top": "-top-1.5 -left-1.5",
  "left-bottom": "-bottom-1.5 -left-1.5",
  "right-top": "-top-1.5 -right-1.5",
  "right-bottom": "-bottom-1.5 -right-1.5",
  "middle-top": "-top-1.5 left-1/2 -translate-x-1/2",
  "middle-bottom": "-bottom-1.5 left-1/2 -translate-x-1/2",
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
    <span className={cn("relative inline-flex p-2", className)} {...props}>
      {children}
      {shouldShow && (
        <span
          className={cn(
            "absolute flex min-w-5 items-center justify-center rounded-full border-2 border-bg px-1.5 text-[11px] font-bold leading-none",
            directionStyles[direction],
            ruleStyles(rule, hasCount),
            dot && "size-3 px-0",
          )}
        >
          {!dot && displayCount}
        </span>
      )}
    </span>
  );
}
