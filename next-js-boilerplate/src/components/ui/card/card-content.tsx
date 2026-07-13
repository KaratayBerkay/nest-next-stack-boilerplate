import { cn } from "@/lib/cn";
import type { CardContentProps } from "@/types/ui/Card-types";

export function CardContent({ className, fontSize, fontWeight, fontFamily, ...props }: CardContentProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-normal";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      className={cn(
        "p-4 pt-0 @sm:p-6 @sm:pt-0",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
