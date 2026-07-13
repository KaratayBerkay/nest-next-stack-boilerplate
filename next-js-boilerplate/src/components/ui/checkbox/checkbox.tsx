"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { CheckboxProps, CheckboxVariant } from "@/types/ui/Checkbox-types";

const checkVariants: Record<CheckboxVariant, string> = {
  ...globalStyleVariants,
  default: "border-border checked:bg-brand checked:border-brand",
};

export function Checkbox({ className, id, label, variant, fontSize, fontWeight, fontFamily, ...props }: CheckboxProps) {
  const effectiveVariant = useComponentVariant(variant);
  const autoId = useId();
  const generatedId = id ?? autoId;
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        id={generatedId}
        className={cn(
          "peer bg-bg focus-visible:ring-brand size-4 shrink-0 cursor-pointer appearance-none rounded border focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          resolveVariant(checkVariants, effectiveVariant),
          className,
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={generatedId}
          className={cn(
            "text-muted cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            fontSizeClass,
            fontWeightClass,
            fontFamilyClass,
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
