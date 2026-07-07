"use client";

import { cn } from "@/lib/cn";
import { useTabsContext } from "./tabs";

interface TabsTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value"
> {
  value: string;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onValueChange(value)}
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:outline-none",
        "data-[state=active]:bg-bg data-[state=active]:text-fg data-[state=active]:shadow-sm",
        "data-[state=inactive]:text-muted data-[state=inactive]:hover:text-fg",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
