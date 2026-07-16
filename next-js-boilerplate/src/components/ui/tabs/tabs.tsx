"use client";

import { cn } from "@/lib/cn";
import { createContext, useCallback, useContext, useId, useState } from "react";
import { fontClasses } from "@/lib/font-classes";
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
  value: controlledValue,
  onValueChange: onControlledChange,
  className,
  orientation = "horizontal",
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeValue = (isControlled ? controlledValue : internalValue) ?? "";
  const baseId = useId();

  const onValueChange = useCallback((value: string) => {
    if (!isControlled) setInternalValue(value);
    onControlledChange?.(value);
  }, [isControlled, onControlledChange]);

  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <TabsContext.Provider value={{ activeValue, onValueChange, baseId, orientation }}>
      <div
        className={cn(
          "w-full",
          className,
          fonts,
        )}
        {...props}
      />
    </TabsContext.Provider>
  );
}
