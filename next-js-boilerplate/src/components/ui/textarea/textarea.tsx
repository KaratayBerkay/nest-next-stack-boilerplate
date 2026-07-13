import { cn } from "@/lib/cn";
import type { TextareaProps, TextareaVariant } from "@/types/ui/Textarea-types";

const variants: Record<TextareaVariant, string> = {
  default: "border-border focus-visible:ring-brand",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 focus-visible:ring-blue-500 text-white placeholder:text-slate-500",
  glass: "bg-white/5 backdrop-blur-md border-white/20 focus-visible:ring-white/50 text-white placeholder:text-slate-400",
  neon: "bg-slate-950/90 border-cyan-500/30 focus-visible:ring-cyan-400 text-cyan-400 placeholder:text-slate-600 shadow-[0_0_15px_rgba(6,182,212,0.1)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 border-transparent focus-visible:ring-purple-500 text-white placeholder:text-slate-600",
};

export function Textarea({ className, error, variant = "default", fontSize, fontWeight, fontFamily, ...props }: TextareaProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-normal";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <textarea
      className={cn(
        "placeholder:text-muted focus-visible:ring-brand flex min-h-20 w-full rounded border bg-transparent px-3 py-2 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        error &&
          "border-red-500 focus-visible:ring-red-500 dark:border-red-500",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      aria-invalid={!!error}
      {...props}
    />
  );
}
