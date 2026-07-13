import { cn } from "@/lib/cn";
import type { ToastDescriptionProps } from "@/types/ui/Toast-types";

export function ToastDescription({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: ToastDescriptionProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      className={cn(
        "text-sm opacity-90",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
