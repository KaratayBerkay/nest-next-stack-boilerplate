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
  destructive: "bg-error text-error-fg",
  success: "bg-success text-success-fg",
  warning: "bg-warning text-warning-fg",
  error: "bg-error text-error-fg",
  info: "bg-info text-info-fg",
  soft: "bg-brand/15 text-brand border border-brand/30",
  dot: "size-2 rounded-full border border-border",
  pill: "rounded-full px-4",
} as const;

const sizeMap: Record<BadgeSize, string> = {
  sm: "px-2 py-0 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

export function Badge({
  variant,
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
        effectiveVariant === "dot"
          ? "p-0"
          : "rounded-full",
        resolveVariant(variants, effectiveVariant),
        effectiveVariant !== "dot" && sizeMap[size],
        fonts,
        className,
      )}
      {...props}
    />
  );
}
