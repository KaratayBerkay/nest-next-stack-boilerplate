"use client";

import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import { usePopover } from "./popover";
import type { PopoverTriggerProps } from "@/types/ui/Popover-types";

export function PopoverTrigger({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: PopoverTriggerProps) {
  const { open, toggle, triggerRef, contentId } = usePopover();

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
        fontClasses({ fontSize, fontWeight, fontFamily }),
        className,
      )}
      onClick={toggle}
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-controls={open ? contentId : undefined}
      {...props}
    />
  );
}
