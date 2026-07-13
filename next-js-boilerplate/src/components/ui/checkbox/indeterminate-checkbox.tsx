"use client";

import { useId, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import type { IndeterminateCheckboxProps } from "@/types/ui/Checkbox-types";

export function IndeterminateCheckbox({
  className,
  id,
  indeterminate = false,
  label,
  checked,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: IndeterminateCheckboxProps) {
  const autoId = useId();
  const generatedId = id ?? autoId;
  const ref = useRef<HTMLInputElement>(null);
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className="inline-flex items-center gap-2">
      <input
        ref={ref}
        type="checkbox"
        id={generatedId}
        checked={checked}
        className={cn(
          "peer border-border bg-bg checked:border-brand checked:bg-brand focus-visible:ring-brand size-4 shrink-0 cursor-pointer appearance-none rounded border focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "indeterminate:border-brand indeterminate:bg-brand",
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
