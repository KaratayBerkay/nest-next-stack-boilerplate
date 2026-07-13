import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { KbdProps, KbdVariant } from "@/types/ui/Kbd-types";

const variants: Record<KbdVariant, string> = {
  default: "bg-surface border-border text-fg",
};

export function Kbd({
  className,
  variant,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: KbdProps) {
  const effectiveVariant = useComponentVariant(variant);
  const variantClass = variants[effectiveVariant as keyof typeof variants];
  const fontSizeClass = fontSize || "text-[10px]";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-mono";

  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-medium opacity-100 select-none",
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
