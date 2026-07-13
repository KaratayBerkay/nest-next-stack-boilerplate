"use client";

import { cn } from "@/lib/cn";
import { useDropdownMenuContext } from "./dropdown-menu";
import { fontClasses } from "@/lib/font-classes";
import type { DropdownMenuTriggerProps } from "@/types/ui/DropdownMenu-types";

const defaultStyles = "text-fg";

export function DropdownMenuTrigger({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      onClick={() => setOpen(!open)}
      className={cn(
        "inline-flex items-center justify-center",
        defaultStyles,
        fonts,
        className,
      )}
      {...props}
    />
  );
}
