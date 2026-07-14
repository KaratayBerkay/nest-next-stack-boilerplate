"use client";

import { cn } from "@/lib/cn";
import type { BadgeButtonProps } from "@/types/ui/BadgeButton-types";

const variants = {
  default: "bg-fg text-bg",
  secondary: "bg-surface text-fg",
  outline: "border border-border text-muted",
  destructive: "bg-error/10 text-error",
  success: "bg-success/10 text-success",
} as const;

export function BadgeButton({
  variant = "default",
  className,
  ...props
}: BadgeButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "focus-visible:ring-brand inline-flex cursor-pointer items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
