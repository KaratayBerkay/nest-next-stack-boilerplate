"use client";

import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { fontClasses } from "@/lib/font-classes";
import type { AlertProps } from "@/types/ui/Alert-types";

const variants = {
  ...globalStyleVariants,
  default: "border-border bg-surface text-fg",
  destructive: "border-error/30 bg-error/10 text-error",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
} as const;

export function Alert({
  variant,
  className,
  fontSize,
  fontWeight,
  fontFamily,
  upper,
  header,
  ...props
}: AlertProps) {
  const effectiveVariant = useComponentVariant(variant);
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 text-sm",
        resolveVariant(variants, effectiveVariant),
        fonts,
        className,
      )}
      {...props}
    >
      {upper && <div className="mb-2 text-xs font-bold uppercase tracking-wider opacity-75">{upper}</div>}
      {header && <div className="mb-2 font-semibold">{header}</div>}
      {props.children}
    </div>
  );
}
