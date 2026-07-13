"use client";

import { cn } from "@/lib/cn";
import { useDropdownMenuContext } from "./dropdown-menu";
import type { DropdownMenuTriggerProps, DropdownMenuVariant } from "@/types/ui/DropdownMenu-types";

const variants: Record<DropdownMenuVariant, string> = {
  default: "text-fg",
  shiny: "text-white",
  glass: "text-white",
  neon: "text-cyan-400",
  gradient: "text-transparent bg-clip-text",
};

export function DropdownMenuTrigger({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef, variant } = useDropdownMenuContext();
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";
  const variantClass = variants[variant || "default"];

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
        variantClass,
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
