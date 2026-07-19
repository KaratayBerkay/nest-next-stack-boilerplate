import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { DialogDescriptionProps } from "@/types/ui/Dialog-types";

export function DialogDescription({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: DialogDescriptionProps) {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <p className={cn("text-muted text-sm", fonts, className)} {...props} />
  );
}
