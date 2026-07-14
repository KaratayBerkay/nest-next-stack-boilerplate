"use client";

import { cn } from "@/lib/cn";
import { variants } from "@/components/ui/button-styles";
import type {
  ButtonGroupProps,
  ButtonGroupItemProps,
} from "@/types/ui/ButtonGroup-types";

export function ButtonGroup({
  children,
  variant = "outline",
  className,
  orientation = "horizontal",
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        orientation === "horizontal"
          ? "inline-flex -space-x-px"
          : "inline-flex flex-col -space-y-px",
        "border-border rounded border",
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
        "focus-visible:ring-brand relative inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        active ? "bg-fg text-bg" : "bg-bg text-muted hover:bg-surface-hover",
        orientation === "horizontal"
          ? "first:rounded-l last:rounded-r"
          : "first:rounded-t last:rounded-b",
        className,
      )}
      {...props}
    />
  );
}
