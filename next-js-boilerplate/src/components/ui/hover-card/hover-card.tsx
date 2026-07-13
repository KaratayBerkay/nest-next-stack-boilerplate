"use client";
import { forwardRef } from "react";
import { Root, Trigger, Portal, Content } from "@radix-ui/react-hover-card";
import { cn } from "@/lib/cn";

const defaultStyles = "bg-bg border-border text-fg";

export const HoverCard = Root;
export const HoverCardTrigger = Trigger;

export const HoverCardContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & {
    sideOffset?: number;
  }
>(({ className, sideOffset = 4, ...props }, ref) => {
  return (
    <Portal>
      <Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-64 rounded-md border p-4 shadow-md",
          defaultStyles,
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
