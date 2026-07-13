"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { CheckboxProps, CheckboxVariant } from "@/types/ui/Checkbox-types";

const checkVariants: Record<CheckboxVariant, string> = {
  default: "border-border checked:bg-brand checked:border-brand",
  shiny: "border-slate-600 checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500 checked:border-transparent",
  glass: "border-white/20 checked:bg-white/30 checked:border-transparent",
  neon: "border-cyan-500/30 checked:bg-cyan-500 checked:border-transparent shadow-[0_0_10px_rgba(6,182,212,0.2)] checked:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
  gradient: "border-slate-600 checked:bg-gradient-to-r checked:from-blue-500 checked:via-purple-500 checked:to-pink-500 checked:border-transparent",
};

export function Checkbox({ className, id, label, variant = "default", fontSize, fontWeight, fontFamily, ...props }: CheckboxProps) {
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
          checkVariants[variant],
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
