"use client";

import { cn } from "@/lib/cn";
import { usePopover } from "./popover";
import type { PopoverTriggerProps, PopoverVariant } from "@/types/ui/Popover-types";

const variants: Record<PopoverVariant, string> = {
  default: "text-fg",
  shiny: "text-white",
  glass: "text-white",
  neon: "text-cyan-400",
  gradient: "text-transparent bg-clip-text",
};

export function PopoverTrigger({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: PopoverTriggerProps) {
  const { open, toggle, triggerRef, variant } = usePopover();
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";
  const variantClass = variants[variant || "default"];

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
        variantClass,
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
