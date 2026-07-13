"use client";

import { cn } from "@/lib/cn";
import { useDialog } from "./dialog";
import type { DialogTriggerProps } from "@/types/ui/Dialog-types";

export function DialogTrigger({ className, fontSize, fontWeight, fontFamily, ...props }: DialogTriggerProps) {
  const { onOpenChange } = useDialog();
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <button
      type="button"
      className={cn(
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      onClick={() => onOpenChange(true)}
      {...props}
    />
  );
}
