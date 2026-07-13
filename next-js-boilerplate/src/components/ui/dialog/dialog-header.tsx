import { cn } from "@/lib/cn";
import type { DialogHeaderProps } from "@/types/ui/Dialog-types";

export function DialogHeader({ className, fontSize, fontWeight, fontFamily, ...props }: DialogHeaderProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-1.5 pr-8",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
