"use client";

import { cn } from "@/lib/cn";
import { useDialog } from "./dialog";
import { fontClasses } from "@/lib/font-classes";
import type { DialogTriggerProps } from "@/types/ui/Dialog-types";

export function DialogTrigger({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  onClick,
  ...props
}: DialogTriggerProps) {
  const { onOpenChange } = useDialog();
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <button
      type="button"
      className={cn(fonts, className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onOpenChange(true);
      }}
      {...props}
    />
  );
}
