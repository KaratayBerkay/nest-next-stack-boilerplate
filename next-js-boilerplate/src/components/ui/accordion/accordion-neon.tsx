"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const AccordionNeon = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-2 shadow-[0_0_20px_rgba(6,182,212,0.15)] pointer-events-none",
      className,
    )}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
    <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
    <div className="pointer-events-auto">{props.children}</div>
  </div>
));
AccordionNeon.displayName = "AccordionNeon";
