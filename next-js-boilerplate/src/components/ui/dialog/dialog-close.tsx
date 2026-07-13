"use client";

import { cn } from "@/lib/cn";
import { useDialog } from "./dialog";
import { fontClasses } from "@/lib/font-classes";
import type { DialogCloseProps } from "@/types/ui/Dialog-types";

export function DialogClose({ className, fontSize, fontWeight, fontFamily, ...props }: DialogCloseProps) {
  const { onOpenChange } = useDialog();
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <button
      type="button"
      className={cn(fonts, className)}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}
