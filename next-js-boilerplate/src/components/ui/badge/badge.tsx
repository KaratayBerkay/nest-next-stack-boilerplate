import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { fontClasses } from "@/lib/font-classes";
import type { BadgeProps } from "@/types/ui/Badge-types";

const variants = {
  ...globalStyleVariants,
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
  variant,
  className,
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
          : "rounded-full px-2.5 py-0.5",
        resolveVariant(variants, effectiveVariant),
        fonts,
        className,
      )}
      {...props}
    />
  );
}
