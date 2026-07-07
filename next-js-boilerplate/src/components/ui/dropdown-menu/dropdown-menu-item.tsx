"use client";

import { cn } from "@/lib/cn";
import { useDropdownMenuContext } from "./dropdown-menu";

interface DropdownMenuItemProps extends React.ComponentPropsWithoutRef<"div"> {
  disabled?: boolean;
}

export function DropdownMenuItem({
  disabled,
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext();

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      data-disabled={disabled ? "" : undefined}
      aria-disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        setOpen(false);
        props.onClick?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!disabled) {
            setOpen(false);
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
