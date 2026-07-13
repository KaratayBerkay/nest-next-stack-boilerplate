"use client";
import { forwardRef } from "react";
import {
  Root,
  Menu,
  Trigger,
  Portal,
  Content,
  Item,
  Separator,
  Label,
} from "@radix-ui/react-menubar";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { MenubarVariant } from "@/types/ui/Menubar-types";

const variants: Record<MenubarVariant, string> = {
  default: "bg-surface border-border text-fg",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950 text-white border-transparent shadow-2xl",
  glass: "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl",
  neon: "bg-slate-950/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text border-transparent shadow-2xl",
};

export const Menubar = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root> & {
    variant?: MenubarVariant;
  }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  const variantClass = variants[effectiveVariant as keyof typeof variants];

  return (
    <Root
      ref={ref}
      className={cn(
        "flex h-9 items-center gap-1 rounded-md border p-1 shadow-sm",
        variantClass,
        className,
      )}
      {...props}
    />
  );
});
Menubar.displayName = "Menubar";

export const MenubarMenu = Menu;
export const MenubarTrigger = forwardRef<
  React.ElementRef<typeof Trigger>,
  React.ComponentPropsWithoutRef<typeof Trigger>
>(({ className, ...props }, ref) => (
  <Trigger
    ref={ref}
    className={cn(
      "focus:bg-surface focus:text-fg data-[state=open]:bg-surface data-[state=open]:text-fg flex cursor-default items-center rounded-sm px-3 py-1 text-sm font-medium outline-none select-none",
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = "MenubarTrigger";

export const MenubarContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className, ...props }, ref) => (
  <Portal>
    <Content
      ref={ref}
      className={cn(
        "bg-bg border-border z-50 min-w-48 overflow-hidden rounded-md border p-1 shadow-md",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-auto">{props.children}</div>
    </Content>
  </Portal>
));
MenubarContent.displayName = "MenubarContent";

export const MenubarItem = forwardRef<
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
MenubarItem.displayName = "MenubarItem";

export const MenubarSeparator = forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
));
MenubarSeparator.displayName = "MenubarSeparator";

export const MenubarLabel = forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("text-muted px-2 py-1.5 text-xs font-semibold", className)}
    {...props}
  />
));
MenubarLabel.displayName = "MenubarLabel";
