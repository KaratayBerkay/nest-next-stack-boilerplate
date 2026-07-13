"use client";

import { cn } from "@/lib/cn";
import { usePopover } from "./popover";
import type { PopoverTriggerProps } from "@/types/ui/Popover-types";

export function PopoverTrigger({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: PopoverTriggerProps) {
  const { open, toggle, triggerRef } = usePopover();
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      onClick={toggle}
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      aria-haspopup="dialog"
      {...props}
    />
  );
}
