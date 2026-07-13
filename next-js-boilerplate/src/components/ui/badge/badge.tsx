import { cn } from "@/lib/cn";
import type { BadgeProps } from "@/types/ui/Badge-types";

const variants = {
  default: "bg-surface text-fg border border-border",
  secondary: "bg-surface text-fg",
  outline: "border border-border text-muted",
  destructive: "bg-error text-error-fg",
  success: "bg-success text-success-fg",
  warning: "bg-warning text-warning-fg",
  error: "bg-error text-error-fg",
  info: "bg-info text-info-fg",
  soft: "bg-brand/15 text-brand border border-brand/30",
  dot: "size-2 rounded-full border border-border",
  pill: "rounded-full px-4",
  shiny: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/20",
  glass: "bg-white/20 backdrop-blur-md text-white border-white/20 shadow-md",
  neon: "bg-slate-950 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text border-transparent",
} as const;

export function Badge({
  variant = "default",
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: BadgeProps) {
  const fontSizeClass = fontSize || "text-xs";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        variant === "dot"
          ? "p-0"
          : "rounded-full px-2.5 py-0.5",
        variants[variant],
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
