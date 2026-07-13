import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { CardProps } from "@/types/ui/Card-types";

export function Card({ className, variant, fontSize, fontWeight, fontFamily, ...props }: CardProps) {
  const effectiveVariant = useComponentVariant(variant);
  const variants = {
    default:
      "border-border bg-bg text-fg rounded-xl border shadow-sm transition-all hover:shadow-md",
    elevated: "border-border bg-bg text-fg rounded-xl border shadow-elevated",
    interactive:
      "border-border bg-bg text-fg rounded-xl border transition-all hover:shadow-md hover:border-brand cursor-pointer",
    outline: "border-2 border-border bg-transparent text-fg rounded-xl",
    surface: "surface rounded-xl",
    shiny: "bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 rounded-xl shadow-2xl shadow-slate-900/50 relative overflow-hidden pointer-events-none",
    glass: "bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-xl relative overflow-hidden pointer-events-none",
    neon: "bg-slate-950/80 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden pointer-events-none",
    gradient: "bg-gradient-to-br from-slate-900 to-slate-950 border border-transparent rounded-xl shadow-2xl relative overflow-hidden pointer-events-none",
  };

  const fontSizeClass = fontSize || "text-base";
  const fontWeightClass = fontWeight || "font-normal";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      className={cn(
        variants[effectiveVariant as keyof typeof variants],
        className,
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
      )}
      {...props}
    >
      {effectiveVariant === "shiny" && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50 pointer-events-none" />
      )}
      {effectiveVariant === "glass" && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
      )}
      {effectiveVariant === "neon" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
        </>
      )}
      {effectiveVariant === "gradient" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
          <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-xl blur opacity-30 transition-opacity duration-500 group-hover:opacity-50 pointer-events-none" />
        </>
      )}
      <div className="pointer-events-auto">{props.children}</div>
    </div>
  );
}
