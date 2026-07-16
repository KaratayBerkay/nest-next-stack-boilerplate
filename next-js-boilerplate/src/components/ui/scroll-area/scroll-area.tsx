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
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants, type GlobalVariant } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

const scrollAreaVariants = {
  ...globalStyleVariants,
  default: "text-fg",
};

export const ScrollArea = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root> & { variant?: GlobalVariant }
>(({ className, children, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Root
      ref={ref}
      className={cn("relative overflow-hidden", resolveVariant(scrollAreaVariants, effectiveVariant), className)}
      {...props}
    >
      <Viewport className="size-full rounded-[inherit]">{children}</Viewport>
      <ScrollBar />
      <Corner />
    </Root>
  );
});
ScrollArea.displayName = "ScrollArea";

export const ScrollBar = forwardRef<
  React.ElementRef<typeof Scrollbar>,
  React.ComponentPropsWithoutRef<typeof Scrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <Scrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none transition-colors select-none",
      orientation === "vertical"
        ? "h-full w-2.5 border-l border-l-transparent p-px"
        : "h-2.5 flex-col border-t border-t-transparent p-px",
      "text-fg",
      className,
    )}
    {...props}
  >
    <Thumb className="bg-border relative flex-1 rounded-full" />
  </Scrollbar>
));
ScrollBar.displayName = "ScrollBar";
