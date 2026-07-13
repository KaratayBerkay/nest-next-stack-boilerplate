"use client";
import { forwardRef } from "react";
import {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
  Separator,
  Label,
} from "@radix-ui/react-context-menu";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { ContextMenuVariant } from "@/types/ui/ContextMenu-types";

const variants: Record<ContextMenuVariant, string> = {
  default: "bg-bg border-border text-fg",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950 text-white border-transparent shadow-2xl",
  glass: "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl",
  neon: "bg-slate-950/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text border-transparent shadow-2xl",
};

export const ContextMenu = Root;
export const ContextMenuTrigger = Trigger;
export const ContextMenuSeparator = forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";
export const ContextMenuLabel = forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("text-muted px-2 py-1.5 text-xs font-semibold", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = "ContextMenuLabel";

export const ContextMenuContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & {
    variant?: ContextMenuVariant;
  }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  const variantClass = variants[effectiveVariant as keyof typeof variants];

  return (
    <Portal>
      <Content
        ref={ref}
        className={cn(
          "z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-md",
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
ContextMenuContent.displayName = "ContextMenuContent";

export const ContextMenuItem = forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item>
>(({ className, ...props }, ref) => (
  <Item
    ref={ref}
    className={cn(
      "focus:bg-surface focus:text-fg relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  />
));
ContextMenuItem.displayName = "ContextMenuItem";
