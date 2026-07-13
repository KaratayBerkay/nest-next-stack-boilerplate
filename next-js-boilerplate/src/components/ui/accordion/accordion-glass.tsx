"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const AccordionGlass = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-2 shadow-xl pointer-events-none",
      className,
    )}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
    <div className="pointer-events-auto">{props.children}</div>
  </div>
));
AccordionGlass.displayName = "AccordionGlass";
