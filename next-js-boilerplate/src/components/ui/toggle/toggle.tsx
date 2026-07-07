"use client";
import { forwardRef } from "react";
import { Root } from "@radix-ui/react-toggle";
import { cn } from "@/lib/cn";

export const Toggle = forwardRef<React.ElementRef<typeof Root>, React.ComponentPropsWithoutRef<typeof Root>>(({ className, ...props }, ref) => (
  <Root ref={ref} className={cn(
    "hover:bg-surface-hover hover:text-muted-foreground focus-visible:ring-brand data-[state=on]:bg-surface data-[state=on]:text-fg inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
    className,
  )} {...props} />
));
Toggle.displayName = "Toggle";
