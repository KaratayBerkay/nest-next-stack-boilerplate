"use client";

import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { fontClasses } from "@/lib/font-classes";
import type { BadgeProps, BadgeSize } from "@/types/ui/Badge-types";

const variants = {
  ...globalStyleVariants,
  default: "bg-brand text-brand-fg",
  secondary: "bg-surface text-fg border border-border",
  outline: "border border-border text-muted",
  success: "bg-success text-success-fg",
  warning: "bg-warning text-warning-fg",
  error: "bg-error text-error-fg",
  info: "bg-info text-info-fg",
  soft: "bg-brand/15 text-brand border border-brand/30",
} as const;

const sizeMap: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] leading-tight",
  md: "px-2.5 py-1 text-xs leading-tight",
  lg: "px-3.5 py-1.5 text-sm leading-tight",
};

export function Badge({
  variant,
  pill,
  dot,
  className,
  size = "md",
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: BadgeProps) {
  const effectiveVariant = useComponentVariant(variant);
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily }, { fontSize: "text-xs" });

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        pill ? "rounded-full" : "rounded-full",
        dot && "p-0 size-2 rounded-full border border-border",
        !dot && resolveVariant(variants, effectiveVariant),
        !dot && sizeMap[size],
        fonts,
        className,
      )}
      {...props}
    />
  );
}
