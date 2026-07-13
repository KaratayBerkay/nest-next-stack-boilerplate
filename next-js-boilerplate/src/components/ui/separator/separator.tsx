import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { SeparatorProps } from "@/types/ui/Separator-types";

export function Separator({
  orientation = "horizontal",
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: SeparatorProps) {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        "bg-border text-fg",
        fonts,
        className,
      )}
      {...props}
    />
  );
}
