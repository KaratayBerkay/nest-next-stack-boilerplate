"use client";
import { forwardRef } from "react";
import { Root, Viewport, Scrollbar, Thumb, Corner } from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/cn";

export const ScrollArea = forwardRef<React.ElementRef<typeof Root>, React.ComponentPropsWithoutRef<typeof Root>>(({ className, children, ...props }, ref) => (
  <Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <Viewport className="size-full rounded-[inherit]">{children}</Viewport>
    <ScrollBar />
    <Corner />
  </Root>
));
ScrollArea.displayName = "ScrollArea";

export const ScrollBar = forwardRef<React.ElementRef<typeof Scrollbar>, React.ComponentPropsWithoutRef<typeof Scrollbar>>(({ className, orientation = "vertical", ...props }, ref) => (
  <Scrollbar ref={ref} orientation={orientation} className={cn("flex touch-none select-none transition-colors", orientation === "vertical" ? "h-full w-2.5 border-l border-l-transparent p-px" : "h-2.5 flex-col border-t border-t-transparent p-px", className)} {...props}>
    <Thumb className="bg-border relative flex-1 rounded-full" />
  </Scrollbar>
));
ScrollBar.displayName = "ScrollBar";
