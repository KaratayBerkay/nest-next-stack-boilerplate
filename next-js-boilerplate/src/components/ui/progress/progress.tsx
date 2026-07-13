"use client";
import { forwardRef } from "react";
import { Root, Indicator } from "@radix-ui/react-progress";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { ProgressProps, ProgressVariant } from "@/types/ui/Progress-types";

const barVariants: Record<ProgressVariant, string> = {
  default: "bg-brand",
  shiny: "bg-gradient-to-r from-blue-500 to-purple-500",
  glass: "bg-white/30",
  neon: "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]",
  gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
};

const trackVariants: Record<ProgressVariant, string> = {
  default: "bg-surface",
  shiny: "bg-slate-800",
  glass: "bg-white/10",
  neon: "bg-slate-900 border border-cyan-500/20",
  gradient: "bg-slate-800",
};

export const Progress = forwardRef<
  React.ElementRef<typeof Root>,
  ProgressProps
>(({ className, variant, value, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        trackVariants[effectiveVariant as keyof typeof trackVariants],
        className,
      )}
      {...props}
    >
      <Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          barVariants[effectiveVariant as keyof typeof barVariants],
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </Root>
  );
});
Progress.displayName = "Progress";
