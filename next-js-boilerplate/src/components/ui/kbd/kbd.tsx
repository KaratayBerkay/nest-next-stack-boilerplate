import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { fontClasses } from "@/lib/font-classes";
import type { KbdProps, KbdVariant } from "@/types/ui/Kbd-types";

const variants: Record<KbdVariant, string> = {
  ...globalStyleVariants,
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
  const variantClass = resolveVariant(variants, effectiveVariant);
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily }, { fontSize: "text-[10px]", fontFamily: "font-mono" });

  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-medium opacity-100 select-none shadow-[inset_0_-1px_0_var(--border)] min-w-5 justify-center",
        variantClass,
        fonts,
        className,
      )}
      {...props}
    />
  );
}
