"use client";
import { forwardRef } from "react";
import { Root, Trigger, Portal, Content } from "@radix-ui/react-hover-card";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import {
  globalStyleVariants,
  type GlobalVariant,
} from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

const hoverCardVariants = {
  ...globalStyleVariants,
  default: "bg-bg border-border text-fg",
};

export const HoverCard = Root;
export const HoverCardTrigger = Trigger;

export const HoverCardContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & {
    sideOffset?: number;
    variant?: GlobalVariant;
  }
>(({ className, sideOffset = 4, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Portal>
      <Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "data-[state=open]:animate-scale-in-breathe z-50 w-72 origin-[--radix-hover-card-content-transform-origin] rounded-lg border p-4 shadow-lg motion-reduce:animate-none",
          resolveVariant(hoverCardVariants, effectiveVariant),
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
