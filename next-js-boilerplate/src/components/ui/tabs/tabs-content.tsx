"use client";

import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useTabsContext } from "./tabs";
import type { TabsContentProps } from "@/types/ui/TabsContent-types";

export function TabsContent({
  value,
  className,
  children,
  variant,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: TabsContentProps) {
  const effectiveVariant = useComponentVariant(variant);
  const { activeValue } = useTabsContext();
  if (activeValue !== value) return null;

  const variants = {
    default: "focus-visible:ring-brand focus-visible:ring-2 focus-visible:outline-none",
    shiny: "bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 rounded-xl p-4 shadow-2xl",
    glass: "bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl",
    neon: "bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    gradient: "bg-gradient-to-br from-slate-900 to-slate-950 border border-transparent rounded-xl p-4 shadow-2xl",
  };

  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-normal";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      role="tabpanel"
      data-state="active"
      className={cn(
        variants[effectiveVariant as keyof typeof variants],
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
