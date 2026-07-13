"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { fontClasses } from "@/lib/font-classes";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { SwitchProps } from "@/types/ui/Switch-types";

const trackVariants = {
  ...globalStyleVariants,
  default: "bg-surface-hover checked:bg-brand",
  outline: "border border-border bg-transparent checked:bg-brand",
};

export function Switch({ className, id, label, variant, fontSize, fontWeight, fontFamily, ...props }: SwitchProps) {
  const autoId = useId();
  const generatedId = id ?? autoId;
  const effectiveVariant = useComponentVariant(variant);

  return (
    <div className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        role="switch"
        id={generatedId}
        className={cn(
          "peer focus-visible:ring-brand relative inline-flex h-5 w-9 shrink-0 cursor-pointer appearance-none items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40",
          "after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] checked:after:translate-x-full",
          resolveVariant(trackVariants, effectiveVariant),
          className,
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={generatedId}
          className={cn(
            "text-muted cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            fontClasses({ fontSize, fontWeight, fontFamily }),
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
