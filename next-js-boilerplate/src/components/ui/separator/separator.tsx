import { cn } from "@/lib/cn";
import type { SeparatorProps } from "@/types/ui/Separator-types";

export function Separator({
  orientation = "horizontal",
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: SeparatorProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        "bg-border text-fg",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
