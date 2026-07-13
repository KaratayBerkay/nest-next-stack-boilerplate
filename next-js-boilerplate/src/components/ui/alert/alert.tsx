"use client";

import { cn } from "@/lib/cn";
import type { AlertProps } from "@/types/ui/Alert-types";

const variants = {
  default: "border-border bg-surface text-fg",
  destructive:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300",
  success:
    "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  shiny: "bg-gradient-to-br from-blue-500 to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/20",
  glass: "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl",
  neon: "bg-slate-950/90 text-cyan-400 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 border-transparent shadow-2xl",
} as const;

export function Alert({
  variant = "default",
  className,
  fontSize,
  fontWeight,
  fontFamily,
  upper,
  header,
  ...props
}: AlertProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 text-sm",
        variants[variant],
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    >
      {upper && <div className="mb-2 text-xs font-bold uppercase tracking-wider opacity-75">{upper}</div>}
      {header && <div className="mb-2 font-semibold">{header}</div>}
      {props.children}
    </div>
  );
}
