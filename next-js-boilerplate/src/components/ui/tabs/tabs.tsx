"use client";

import { cn } from "@/lib/cn";
import { createContext, useCallback, useContext, useId, useState } from "react";
import type { TabsProps } from "@/types/ui/Tabs-types";

interface TabsContextValue {
  activeValue: string;
  onValueChange: (value: string) => void;
  baseId: string;
  orientation: "horizontal" | "vertical";
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

export function Tabs({
  defaultValue,
  className,
  orientation = "horizontal",
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: TabsProps) {
  const [activeValue, setActiveValue] = useState(defaultValue);
  const baseId = useId();

  const onValueChange = useCallback((value: string) => {
    setActiveValue(value);
  }, []);

  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <TabsContext.Provider value={{ activeValue, onValueChange, baseId, orientation }}>
      <div
        className={cn(
          "w-full",
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
