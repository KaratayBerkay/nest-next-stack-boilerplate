import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { DropdownMenuSeparatorProps } from "@/types/ui/DropdownMenu-types";

export function DropdownMenuSeparator({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: DropdownMenuSeparatorProps) {
  const fonts = fontClasses(
    { fontSize, fontWeight, fontFamily },
    { fontSize: "text-xs" },
  );

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("bg-border -mx-1 my-1 h-px", fonts, className)}
      {...props}
    />
  );
}
