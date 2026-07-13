import { cn } from "@/lib/cn";
import type { DropdownMenuLabelProps } from "@/types/ui/DropdownMenu-types";

export function DropdownMenuLabel({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: DropdownMenuLabelProps) {
  const fontSizeClass = fontSize || "text-xs";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      className={cn(
        "text-muted px-2 py-1.5 text-xs font-medium",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
