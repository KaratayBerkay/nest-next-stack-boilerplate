import { cn } from "@/lib/cn";
import type { DialogFooterProps } from "@/types/ui/Dialog-types";

export function DialogFooter({ className, fontSize, fontWeight, fontFamily, ...props }: DialogFooterProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 pt-2",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
