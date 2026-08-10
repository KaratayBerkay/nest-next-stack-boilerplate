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
  Cancel,
  Action,
} from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import {
  globalStyleVariants,
  type GlobalVariant,
} from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import {
  variants as buttonVariants,
  sizes as buttonSizes,
  sizeFonts as buttonSizeFonts,
  type Variant as ButtonVariant,
  type Size as ButtonSize,
} from "@/components/ui/button-styles";
import type { AlertDialogButtonProps } from "@/types/ui/AlertDialog-types";

const alertDialogVariants = {
  ...globalStyleVariants,
  default: "bg-bg border-border border shadow-xl rounded-xl",
};

// Same interactive base Button itself uses (button/button.tsx) — Trigger/
// Cancel/Action are semantically buttons (they render Radix's own <button>),
// so they should look pixel-identical to <Button> given the same variant.
const alertDialogButtonBase =
  "ring-offset-bg relative inline-flex items-center justify-center rounded-md whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

function useAlertDialogButtonClasses(
  variant: ButtonVariant | undefined,
  size: ButtonSize,
  className: string | undefined,
) {
  const effectiveVariant = useComponentVariant(variant);
  return cn(
    alertDialogButtonBase,
    buttonSizes[size],
    buttonSizeFonts[size],
    resolveVariant(buttonVariants, effectiveVariant),
    className,
  );
}

export const AlertDialog = Root;

export const AlertDialogTrigger = forwardRef<
  React.ElementRef<typeof Trigger>,
  AlertDialogButtonProps
>(({ className, variant, size = "md", ...props }, ref) => (
  <Trigger
    ref={ref}
    className={useAlertDialogButtonClasses(variant, size, className)}
    {...props}
  />
));
AlertDialogTrigger.displayName = "AlertDialogTrigger";

export const AlertDialogCancel = forwardRef<
  React.ElementRef<typeof Cancel>,
  AlertDialogButtonProps
>(({ className, variant = "outline", size = "md", ...props }, ref) => (
  <Cancel
    ref={ref}
    className={useAlertDialogButtonClasses(variant, size, className)}
    {...props}
  />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export const AlertDialogAction = forwardRef<
  React.ElementRef<typeof Action>,
  AlertDialogButtonProps
>(({ className, variant = "primary", size = "md", ...props }, ref) => (
  <Action
    ref={ref}
    className={useAlertDialogButtonClasses(variant, size, className)}
    {...props}
  />
));
AlertDialogAction.displayName = "AlertDialogAction";
export const AlertDialogHeader = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
    {...props}
  />
));
AlertDialogHeader.displayName = "AlertDialogHeader";
export const AlertDialogFooter = forwardRef<
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
AlertDialogFooter.displayName = "AlertDialogFooter";

export const AlertDialogContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & { variant?: GlobalVariant }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Portal>
      <Overlay className="data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out bg-overlay/50 fixed inset-0 z-50" />
      <Content
        ref={ref}
        className={cn(
          "data-[state=open]:animate-fade-in-up data-[state=closed]:animate-fade-out fixed top-[50%] left-[50%] z-50 grid max-h-[85vh] w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto p-6 duration-200",
          resolveVariant(alertDialogVariants, effectiveVariant),
          className,
        )}
        {...props}
      />
    </Portal>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

export const AlertDialogTitle = forwardRef<
  React.ElementRef<typeof Title>,
  React.ComponentPropsWithoutRef<typeof Title>
>(({ className, ...props }, ref) => (
  <Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = forwardRef<
  React.ElementRef<typeof Description>,
  React.ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
  <Description
    ref={ref}
    className={cn("text-muted text-sm", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";
