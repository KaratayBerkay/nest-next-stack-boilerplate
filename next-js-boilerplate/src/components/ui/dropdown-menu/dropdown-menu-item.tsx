"use client";

import { cn } from "@/lib/cn";
import { menuItemStyles } from "@/components/ui/menu-item-styles";
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
          onKeyDown?.(e);
          if (!disabled && !e.defaultPrevented) {
            e.preventDefault();
            closeAndFocusTrigger();
            (e.target as HTMLElement)?.click();
          }
        }
      }}
      className={cn(
        menuItemStyles,
        "cursor-pointer hover:bg-surface-hover focus-visible:bg-surface-hover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
