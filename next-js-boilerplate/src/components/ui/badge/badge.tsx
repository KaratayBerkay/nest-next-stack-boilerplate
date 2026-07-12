import { cn } from "@/lib/cn";
import type { BadgeProps } from "@/types/ui/Badge-types";

const variants = {
  default: "bg-surface text-fg border border-border",
  secondary: "bg-surface text-fg",
  outline: "border border-border text-muted",
  destructive: "bg-error text-error-fg",
  success: "bg-success text-success-fg",
  warning: "bg-warning text-warning-fg",
  error: "bg-error text-error-fg",
  info: "bg-info text-info-fg",
  soft: "bg-brand/15 text-brand border border-brand/30",
  dot: "size-2 rounded-full border border-border",
  pill: "rounded-full px-4",
} as const;

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        variant === "dot"
          ? "p-0"
          : "rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
