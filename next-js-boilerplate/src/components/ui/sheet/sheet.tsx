"use client";
import { forwardRef } from "react";
import {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Close,
} from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants, type GlobalVariant } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

const sheetVariants = {
  ...globalStyleVariants,
  default: "bg-bg border-border text-fg",
};

export const Sheet = Root;
export const SheetTrigger = Trigger;
export const SheetClose = Close;

export const SheetContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & {
    side?: "top" | "bottom" | "left" | "right";
    variant?: GlobalVariant;
  }
>(({ className, children, side = "right", variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);

  return (
    <Portal>
      <Overlay className="data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed inset-0 z-40 bg-overlay/50" />
      <Content
        ref={ref}
        className={cn(
          "fixed z-50 gap-4 p-6 shadow-lg transition ease-in-out",
          resolveVariant(sheetVariants, effectiveVariant),
          side === "top" &&
            "data-[state=open]:animate-fade-in-down inset-x-0 top-0 border-b",
          side === "bottom" &&
            "data-[state=open]:animate-fade-in-up inset-x-0 bottom-0 border-t",
          side === "left" &&
            "data-[state=open]:animate-slide-in-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "right" &&
            "data-[state=open]:animate-slide-in-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          className,
        )}
        {...props}
      >
        {children}
        <Close className="text-muted hover:bg-surface-hover absolute top-4 right-4 size-7 rounded-md inline-flex items-center justify-center transition-colors">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </Close>
      </Content>
    </Portal>
  );
});
SheetContent.displayName = "SheetContent";

export const SheetHeader = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1 text-center sm:text-left", className)}
    {...props}
  />
));
SheetHeader.displayName = "SheetHeader";

export const SheetFooter = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
));
SheetFooter.displayName = "SheetFooter";

export const SheetTitle = forwardRef<
  React.ElementRef<typeof Title>,
  React.ComponentPropsWithoutRef<typeof Title>
>(({ className, ...props }, ref) => (
  <Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = forwardRef<
  React.ElementRef<typeof Description>,
  React.ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description
    ref={ref}
    className={cn("text-muted text-sm", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";
