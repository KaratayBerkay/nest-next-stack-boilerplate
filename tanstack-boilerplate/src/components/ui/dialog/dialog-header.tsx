import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { DialogHeaderProps } from "@/types/ui/Dialog-types";

export function DialogHeader({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: DialogHeaderProps) {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-1.5 pt-6 pr-12 pl-6",
        fonts,
        className,
      )}
      {...props}
    />
  );
}
