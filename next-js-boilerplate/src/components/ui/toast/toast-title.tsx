import { cn } from "@/lib/cn";
import type { ToastTitleProps } from "@/types/ui/Toast-types";

export function ToastTitle({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: ToastTitleProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-semibold";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      className={cn(
        "text-sm font-semibold",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
