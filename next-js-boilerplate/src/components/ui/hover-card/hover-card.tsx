"use client";
import { forwardRef } from "react";
import { Root, Trigger, Portal, Content } from "@radix-ui/react-hover-card";
import { cn } from "@/lib/cn";
import type { HoverCardVariant } from "@/types/ui/HoverCard-types";

const variants: Record<HoverCardVariant, string> = {
  default: "bg-bg border-border text-fg",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950 text-white border-transparent shadow-2xl",
  glass: "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl",
  neon: "bg-slate-950/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text border-transparent shadow-2xl",
};

export const HoverCard = Root;
export const HoverCardTrigger = Trigger;

export const HoverCardContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & {
    sideOffset?: number;
    variant?: HoverCardVariant;
  }
>(({ className, sideOffset = 4, variant = "default", ...props }, ref) => {
  const variantClass = variants[variant];

  return (
    <Portal>
      <Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-64 rounded-md border p-4 shadow-md",
          variantClass,
          className,
        )}
        {...props}
      >
        <div className="pointer-events-auto">{props.children}</div>
      </Content>
    </Portal>
  );
});
HoverCardContent.displayName = "HoverCardContent";
