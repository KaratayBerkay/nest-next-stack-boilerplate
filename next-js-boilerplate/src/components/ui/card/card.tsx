"use client";

import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { fontClasses } from "@/lib/font-classes";
import type { CardProps } from "@/types/ui/Card-types";

export function Card({
  className,
  variant,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: CardProps) {
  const effectiveVariant = useComponentVariant(variant);
  const variants = {
    ...globalStyleVariants,
    default: "border-border bg-bg text-fg rounded-xl border shadow-xs",
    elevated: "border-border bg-bg text-fg rounded-xl border shadow-md",
    interactive:
      "border-border bg-bg text-fg rounded-xl border shadow-xs transition-[box-shadow,transform] hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-brand cursor-pointer",
    outline: "border-2 border-border bg-transparent text-fg rounded-xl",
    surface: "surface rounded-xl",
  };

  const fonts = fontClasses(
    { fontSize, fontWeight, fontFamily },
    { fontSize: "text-base", fontWeight: "font-normal" },
  );

  return (
    <div
      className={cn(
        resolveVariant(variants, effectiveVariant),
        className,
        fonts,
      )}
      {...props}
    >
      <div className="pointer-events-auto">{props.children}</div>
    </div>
  );
}
