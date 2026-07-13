"use client";
import { forwardRef } from "react";
import {
  Root,
  Viewport,
  Scrollbar,
  Thumb,
  Corner,
} from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/cn";
import type { ScrollAreaVariant } from "@/types/ui/ScrollArea-types";

const variants: Record<ScrollAreaVariant, string> = {
  default: "text-fg",
  shiny: "text-white",
  glass: "text-white",
  neon: "text-cyan-400",
  gradient: "text-transparent bg-clip-text",
};

export const ScrollArea = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root> & {
    variant?: ScrollAreaVariant;
  }
>(({ className, children, variant = "default", ...props }, ref) => {
  const variantClass = variants[variant];

  return (
    <Root
      ref={ref}
      className={cn(
        "relative overflow-hidden",
        variantClass,
        className,
      )}
      {...props}
    >
      <Viewport className="size-full rounded-[inherit]">{children}</Viewport>
      <ScrollBar variant={variant} />
      <Corner />
    </Root>
  );
});
ScrollArea.displayName = "ScrollArea";

export const ScrollBar = forwardRef<
  React.ElementRef<typeof Scrollbar>,
  React.ComponentPropsWithoutRef<typeof Scrollbar> & {
    variant?: ScrollAreaVariant;
  }
>(({ className, orientation = "vertical", variant = "default", ...props }, ref) => {
  const variantClass = variants[variant];

  return (
    <Scrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none transition-colors select-none",
        orientation === "vertical"
          ? "h-full w-2.5 border-l border-l-transparent p-px"
          : "h-2.5 flex-col border-t border-t-transparent p-px",
        variantClass,
        className,
      )}
      {...props}
    >
      <Thumb className="bg-border relative flex-1 rounded-full" />
    </Scrollbar>
  );
});
ScrollBar.displayName = "ScrollBar";
