"use client";

import { cn } from "@/lib/cn";
import { createContext, useCallback, useContext, useState } from "react";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { TabsProps } from "@/types/ui/Tabs-types";

interface TabsContextValue {
  activeValue: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

export function Tabs({ defaultValue, className, variant, type = "single", fontSize, fontWeight, fontFamily, ...props }: TabsProps) {
  const effectiveVariant = useComponentVariant(variant);
  const [activeValue, setActiveValue] = useState(defaultValue);

  const onValueChange = useCallback((value: string) => {
    setActiveValue(value);
  }, []);

  const variants = {
    default: "w-full",
    shiny: "w-full bg-slate-900/50 rounded-2xl p-1",
    glass: "w-full bg-white/5 backdrop-blur-md rounded-2xl p-1",
    neon: "w-full bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-1 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    gradient: "w-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-1 shadow-2xl",
  };

  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <TabsContext.Provider value={{ activeValue, onValueChange }}>
      <div
        className={cn(
          variants[effectiveVariant as keyof typeof variants],
          className,
          fontSizeClass,
          fontWeightClass,
          fontFamilyClass,
        )}
        {...props}
      />
    </TabsContext.Provider>
  );
}
