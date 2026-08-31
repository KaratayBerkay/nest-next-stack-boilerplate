// Exempt from global style system — structural/utility component with no styleable surface.
import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { SeparatorProps } from "@/types/ui/Separator-types";

export function Separator({
  orientation = "horizontal",
  label,
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: SeparatorProps) {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  if (label && orientation === "horizontal") {
    return (
      <div
        role="separator"
        aria-orientation={orientation}
        className={cn("flex items-center gap-3", fonts, className)}
        {...props}
      >
        <span className="bg-border h-px flex-1" />
        <span className="text-muted text-xs whitespace-nowrap">{label}</span>
        <span className="bg-border h-px flex-1" />
      </div>
    );
  }

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
