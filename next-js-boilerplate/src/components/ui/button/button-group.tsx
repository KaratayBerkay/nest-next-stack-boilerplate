"use client";

import { cn } from "@/lib/cn";
import type {
  ButtonGroupProps,
  ButtonGroupItemProps,
} from "@/types/ui/ButtonGroup-types";

export function ButtonGroup({
  children,
  className,
  orientation = "horizontal",
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        // w-fit prevents flex-column parents (align-items: stretch) from
        // stretching the group to full container width.
        "border-border divide-border inline-flex w-fit rounded-md border shadow-xs",
        orientation === "horizontal" ? "divide-x" : "flex-col divide-y",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ButtonGroupItem({
  active,
  className,
  orientation = "horizontal",
  ...props
}: ButtonGroupItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "focus-visible:ring-brand relative inline-flex h-8 items-center gap-2 px-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        active
          ? "bg-brand/10 text-brand"
          : "bg-bg text-muted hover:bg-surface-hover hover:text-fg",
        orientation === "horizontal"
          ? "justify-center first:rounded-l-md last:rounded-r-md"
          : "justify-start first:rounded-t-md last:rounded-b-md",
        className,
      )}
      {...props}
    />
  );
}
