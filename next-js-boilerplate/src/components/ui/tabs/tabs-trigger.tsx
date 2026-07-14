"use client";

import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { fontClasses } from "@/lib/font-classes";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useTabsContext } from "./tabs";
import type { TabsTriggerProps } from "@/types/ui/TabsTrigger-types";

const variants = {
  ...globalStyleVariants,
  default: "data-[state=active]:bg-bg data-[state=active]:text-fg data-[state=active]:shadow-sm data-[state=inactive]:text-muted data-[state=inactive]:hover:text-fg",
  underline: "data-[state=active]:border-b-2 data-[state=active]:border-brand rounded-none",
  pills: "data-[state=active]:bg-brand data-[state=active]:text-brand-fg rounded-full",
};

export function TabsTrigger({
  value,
  className,
  variant,
  children,
  fontSize,
  fontWeight,
  fontFamily,
  onClick,
  ...props
}: TabsTriggerProps) {
  const { activeValue, onValueChange, baseId } = useTabsContext();
  const isActive = activeValue === value;
  const effectiveVariant = useComponentVariant(variant);

  const panelId = `${baseId}-panel-${value}`;
  const triggerId = `${baseId}-trigger-${value}`;

  return (
    <button
      id={triggerId}
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={panelId}
      data-state={isActive ? "active" : "inactive"}
      tabIndex={isActive ? 0 : -1}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onValueChange(value);
      }}
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center rounded-md px-3 py-1.5 whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:outline-none",
        resolveVariant(variants, effectiveVariant),
        fontClasses({ fontSize, fontWeight, fontFamily }),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
