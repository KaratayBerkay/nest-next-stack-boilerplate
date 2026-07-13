"use client";

import { cn } from "@/lib/cn";
import { useDialog } from "./dialog";
import type { DialogCloseProps } from "@/types/ui/Dialog-types";

export function DialogClose({ className, fontSize, fontWeight, fontFamily, ...props }: DialogCloseProps) {
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
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}
