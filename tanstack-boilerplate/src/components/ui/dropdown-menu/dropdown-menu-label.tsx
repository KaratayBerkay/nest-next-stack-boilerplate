import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { DropdownMenuLabelProps } from "@/types/ui/DropdownMenu-types";

export function DropdownMenuLabel({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: DropdownMenuLabelProps) {
  const fonts = fontClasses(
    { fontSize, fontWeight, fontFamily },
    { fontSize: "text-xs" },
  );

  return (
    <div
      className={cn(
        "text-muted px-2 py-1.5 text-xs font-medium",
        fonts,
        className,
      )}
      {...props}
    />
  );
}
