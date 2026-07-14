"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { fontClasses } from "@/lib/font-classes";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { SwitchProps, SwitchSize } from "@/types/ui/Switch-types";

const trackVariants = {
  ...globalStyleVariants,
  default: "bg-surface-hover checked:bg-brand",
  outline: "border border-border bg-transparent checked:bg-brand",
};

const sizeMap: Record<SwitchSize, { track: string; thumb: string }> = {
  sm: { track: "h-4.5 w-8", thumb: "after:size-3" },
  md: { track: "h-5.5 w-10", thumb: "after:size-4" },
  lg: { track: "h-6.5 w-12", thumb: "after:size-5" },
};

export function Switch({ className, id, label, variant, switchSize = "md", fontSize, fontWeight, fontFamily, ...props }: SwitchProps) {
  const autoId = useId();
  const generatedId = id ?? autoId;
  const effectiveVariant = useComponentVariant(variant);
  const sizes = sizeMap[switchSize];

  return (
    <div className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        role="switch"
        id={generatedId}
        className={cn(
          "peer focus-visible:ring-brand relative inline-flex shrink-0 cursor-pointer appearance-none items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "after:rounded-full after:bg-bg after:shadow-xs after:transition-transform after:content-[''] checked:after:translate-x-full",
          resolveVariant(trackVariants, effectiveVariant),
          sizes.track,
          sizes.thumb,
          className,
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={generatedId}
          className={cn(
            "text-fg cursor-pointer text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            fontClasses({ fontSize, fontWeight, fontFamily }),
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
