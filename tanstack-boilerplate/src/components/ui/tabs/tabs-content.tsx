"use client";

import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
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
  const { activeValue, baseId } = useTabsContext();
  if (activeValue !== value) return null;

  const panelId = `${baseId}-panel-${value}`;
  const triggerId = `${baseId}-trigger-${value}`;

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={triggerId}
      tabIndex={0}
      data-state="active"
      className={cn(
        "focus-visible:ring-brand focus-visible:ring-2 focus-visible:outline-none",
        fontClasses(
          { fontSize, fontWeight, fontFamily },
          { fontWeight: "font-normal" },
        ),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
