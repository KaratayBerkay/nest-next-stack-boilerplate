"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { SwitchProps } from "@/types/ui/Switch-types";

export function Switch({ className, id, label, fontSize, fontWeight, fontFamily, ...props }: SwitchProps) {
  const autoId = useId();
  const generatedId = id ?? autoId;
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        role="switch"
        id={generatedId}
        className={cn(
          "peer focus-visible:ring-brand relative inline-flex h-5 w-9 shrink-0 cursor-pointer appearance-none items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] checked:after:translate-x-full",
          "bg-surface-hover checked:bg-brand",
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
