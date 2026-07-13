import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { SeparatorProps, SeparatorVariant } from "@/types/ui/Separator-types";

const variants: Record<SeparatorVariant, string> = {
  default: "bg-border text-fg",
  shiny: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
  glass: "bg-white/20 text-white",
  neon: "bg-cyan-500/30 text-cyan-400",
  gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text",
};

export function Separator({
  orientation = "horizontal",
  className,
  variant,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: SeparatorProps) {
  const effectiveVariant = useComponentVariant(variant);
  const variantClass = variants[effectiveVariant as keyof typeof variants];
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        variantClass,
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
