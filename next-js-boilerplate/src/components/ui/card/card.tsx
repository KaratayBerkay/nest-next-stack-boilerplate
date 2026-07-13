import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { CardProps } from "@/types/ui/Card-types";

export function Card({ className, variant, fontSize, fontWeight, fontFamily, ...props }: CardProps) {
  const effectiveVariant = useComponentVariant(variant);
  const variants = {
    ...globalStyleVariants,
    default:
      "border-border bg-bg text-fg rounded-xl border shadow-sm transition-all hover:shadow-md",
    elevated: "border-border bg-bg text-fg rounded-xl border shadow-elevated",
    interactive:
      "border-border bg-bg text-fg rounded-xl border transition-all hover:shadow-md hover:border-brand cursor-pointer",
    outline: "border-2 border-border bg-transparent text-fg rounded-xl",
    surface: "surface rounded-xl",
  };

  const fontSizeClass = fontSize || "text-base";
  const fontWeightClass = fontWeight || "font-normal";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      className={cn(
        resolveVariant(variants, effectiveVariant),
        className,
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
      )}
      {...props}
    >
      <div className="pointer-events-auto">{props.children}</div>
    </div>
  );
}
