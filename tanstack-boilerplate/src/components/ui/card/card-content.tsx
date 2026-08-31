import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { CardContentProps } from "@/types/ui/Card-types";

export function CardContent({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: CardContentProps) {
  const fonts = fontClasses(
    { fontSize, fontWeight, fontFamily },
    { fontWeight: "font-normal" },
  );

  return (
    <div
      className={cn("p-4 pt-0 @sm:p-6 @sm:pt-0", fonts, className)}
      {...props}
    />
  );
}
