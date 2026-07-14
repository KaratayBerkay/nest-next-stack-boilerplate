"use client";
// Vaul Drawer — wraps vaul's Root. Props like `snapPoints`, `snapTo`,
// `fadeFromIndex`, `closeThreshold`, `scrollLockTimeout` pass through.
import { forwardRef } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/cn";

export const Drawer = DrawerPrimitive.Root;
export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerClose = DrawerPrimitive.Close;

export const DrawerContent = forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPrimitive.Portal>
    <DrawerPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay/50" />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-2xl border px-4 pb-6",
        "border-border bg-bg text-fg",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
      <div className="pointer-events-auto">{children}</div>
    </DrawerPrimitive.Content>
  </DrawerPrimitive.Portal>
));
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
