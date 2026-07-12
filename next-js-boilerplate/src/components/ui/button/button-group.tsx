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
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex -space-x-px",
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
  ...props
}: ButtonGroupItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "focus-visible:ring-brand relative inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-all focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40",
        active ? "bg-fg text-bg" : "bg-bg text-muted hover:bg-surface-hover",
        "first:rounded-l last:rounded-r",
        className,
      )}
      {...props}
    />
  );
}
