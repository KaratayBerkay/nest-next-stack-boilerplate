import { cn } from "@/lib/cn";
import type { DropdownMenuSeparatorProps } from "@/types/ui/DropdownMenu-types";

export function DropdownMenuSeparator({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: DropdownMenuSeparatorProps) {
  const fontSizeClass = fontSize || "text-xs";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        "bg-border -mx-1 my-1 h-px",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
