"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { SwitchProps, SwitchVariant } from "@/types/ui/Switch-types";

const variants: Record<SwitchVariant, string> = {
  default: "bg-surface-hover checked:bg-brand",
  shiny: "bg-slate-700 checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500",
  glass: "bg-white/10 checked:bg-white/30",
  neon: "bg-slate-800 checked:bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)] checked:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
  gradient: "bg-slate-800 checked:bg-gradient-to-r checked:from-blue-500 checked:via-purple-500 checked:to-pink-500",
};

export function Switch({ className, id, label, variant = "default", fontSize, fontWeight, fontFamily, ...props }: SwitchProps) {
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
          variants[variant],
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
