"use client";
import { forwardRef } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/cn";
import type { DrawerVariant } from "@/types/ui/Drawer-types";

const variants: Record<DrawerVariant, string> = {
  default: "border-border bg-bg text-fg",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950 text-white border-transparent shadow-2xl",
  glass: "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl",
  neon: "bg-slate-950/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text border-transparent shadow-2xl",
};

export const Drawer = DrawerPrimitive.Root;
export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerClose = DrawerPrimitive.Close;

export const DrawerContent = forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    variant?: DrawerVariant;
  }
>(({ className, children, variant = "default", ...props }, ref) => {
  const variantClass = variants[variant];

  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50" />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-xl border p-4",
          variantClass,
          className,
        )}
        {...props}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full" />
        <div className="pointer-events-auto">{children}</div>
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
});
DrawerContent.displayName = "DrawerContent";

export const DrawerHeader = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid gap-1 text-center sm:text-left", className)}
    {...props}
  />
));
DrawerHeader.displayName = "DrawerHeader";

export const DrawerFooter = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col sm:flex-row sm:justify-end sm:gap-2",
      className,
    )}
    {...props}
  />
));
DrawerFooter.displayName = "DrawerFooter";

export const DrawerTitle = forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription = forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-muted text-sm", className)}
    {...props}
  />
));
DrawerDescription.displayName = "DrawerDescription";
