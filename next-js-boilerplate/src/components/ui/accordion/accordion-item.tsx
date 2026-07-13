"use client";

import { forwardRef } from "react";
import { Item } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";

export const AccordionItem = forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item> & { variant?: "default" | "shiny" | "glass" | "neon" | "gradient" }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  const variants = {
    default: "border-border border-b",
    shiny: "border-slate-700/50 border-b hover:border-slate-600 transition-colors",
    glass: "border-white/10 border-b hover:border-white/20 transition-colors",
    neon: "border-cyan-500/30 border-b hover:border-cyan-400/50 transition-colors",
    gradient: "border-transparent border-b hover:border-slate-700 transition-colors",
  };

  return (
    <Item
      ref={ref}
      className={cn(variants[effectiveVariant as keyof typeof variants], className)}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";
