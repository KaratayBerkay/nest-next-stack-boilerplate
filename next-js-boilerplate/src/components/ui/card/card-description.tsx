import { cn } from "@/lib/cn";
import type { CardDescriptionProps } from "@/types/ui/Card-types";

export function CardDescription({ className, fontSize, fontWeight, fontFamily, ...props }: CardDescriptionProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-normal";
  const fontFamilyClass = fontFamily || "font-sans";

  return <p className={cn("text-muted", fontSizeClass, fontWeightClass, fontFamilyClass, className)} {...props} />;
}
