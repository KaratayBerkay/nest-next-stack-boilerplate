"use client";

import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useTabsContext } from "./tabs";
import type { TabsTriggerProps } from "@/types/ui/TabsTrigger-types";

export function TabsTrigger({
  value,
  className,
  children,
  variant,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: TabsTriggerProps) {
  const effectiveVariant = useComponentVariant(variant);
  const { activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  const variants = {
    default: "data-[state=active]:bg-bg data-[state=active]:text-fg data-[state=active]:shadow-sm data-[state=inactive]:text-muted data-[state=inactive]:hover:text-fg",
    shiny: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white",
    glass: "data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-white",
    neon: "data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:shadow-[0_0_15px_rgba(6,182,212,0.3)] data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-cyan-400",
    gradient: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:shadow-lg data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-transparent",
  };

  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onValueChange(value)}
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center rounded-md px-3 py-1.5 whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:outline-none",
        variants[effectiveVariant as keyof typeof variants],
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
