"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const AccordionShiny = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-lg pointer-events-none",
      className,
    )}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50 transition-opacity duration-500 pointer-events-none" />
    <div className="pointer-events-auto">{props.children}</div>
  </div>
));
AccordionShiny.displayName = "AccordionShiny";
