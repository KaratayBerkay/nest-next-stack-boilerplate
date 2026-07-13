import { cn } from "@/lib/cn";
import type { DialogDescriptionProps } from "@/types/ui/Dialog-types";

export function DialogDescription({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: DialogDescriptionProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <p
      className={cn(
        "text-muted text-sm",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
