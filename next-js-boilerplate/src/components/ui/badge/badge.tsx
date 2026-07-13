import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
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
  variant,
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: BadgeProps) {
  const effectiveVariant = useComponentVariant(variant);
  const fontSizeClass = fontSize || "text-xs";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        effectiveVariant === "dot"
          ? "p-0"
          : "rounded-full px-2.5 py-0.5",
        variants[effectiveVariant as keyof typeof variants],
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
