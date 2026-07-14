"use client";

import { cn } from "@/lib/cn";
import { useDropdownMenuContext } from "./dropdown-menu";
import type { DropdownMenuItemProps } from "@/types/ui/DropdownMenuItem-types";

export function DropdownMenuItem({
  disabled,
  className,
  children,
  onClick,
  onKeyDown,
  ...props
}: DropdownMenuItemProps) {
  const { closeAndFocusTrigger } = useDropdownMenuContext();

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      data-disabled={disabled ? "" : undefined}
      aria-disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
        if (!e.defaultPrevented) closeAndFocusTrigger();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onKeyDown?.(e);
          if (!disabled && !e.defaultPrevented) {
            closeAndFocusTrigger();
            (e.target as HTMLElement)?.click();
          }
        }
      }}
      className={cn(
        "relative flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm transition-colors outline-none select-none",
        "hover:bg-surface-hover focus-visible:bg-surface-hover",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
