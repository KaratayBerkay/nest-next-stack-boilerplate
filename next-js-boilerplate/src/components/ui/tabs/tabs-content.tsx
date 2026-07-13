"use client";

import { cn } from "@/lib/cn";
import { useTabsContext } from "./tabs";
import type { TabsContentProps } from "@/types/ui/TabsContent-types";

export function TabsContent({
  value,
  className,
  children,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: TabsContentProps) {
  const { activeValue } = useTabsContext();
  if (activeValue !== value) return null;

  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-normal";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      role="tabpanel"
      data-state="active"
      className={cn(
        "focus-visible:ring-brand focus-visible:ring-2 focus-visible:outline-none",
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
