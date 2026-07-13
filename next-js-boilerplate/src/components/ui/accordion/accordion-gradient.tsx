"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const AccordionGradient = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-slate-900 to-slate-950 p-2 shadow-2xl pointer-events-none",
      className,
    )}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-30 transition-opacity duration-500 group-hover:opacity-50 pointer-events-none" />
    <div className="pointer-events-auto">{props.children}</div>
  </div>
));
AccordionGradient.displayName = "AccordionGradient";
