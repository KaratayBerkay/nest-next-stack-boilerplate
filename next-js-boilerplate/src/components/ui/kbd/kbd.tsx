import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { KbdProps, KbdVariant } from "@/types/ui/Kbd-types";

const variants: Record<KbdVariant, string> = {
  default: "bg-surface border-border text-fg",
  shiny: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/20",
  glass: "bg-white/20 backdrop-blur-md text-white border-white/20 shadow-md",
  neon: "bg-slate-950 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text border-transparent",
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
