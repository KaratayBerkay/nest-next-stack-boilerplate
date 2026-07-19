import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { CardDescriptionProps } from "@/types/ui/Card-types";

export function CardDescription({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: CardDescriptionProps) {
  const fonts = fontClasses(
    { fontSize, fontWeight, fontFamily },
    { fontWeight: "font-normal" },
  );

  return <p className={cn("text-muted", fonts, className)} {...props} />;
}
