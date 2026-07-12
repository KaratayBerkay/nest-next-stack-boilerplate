"use client";
import { forwardRef } from "react";
import { Root, Trigger, Portal, Content } from "@radix-ui/react-hover-card";
import { cn } from "@/lib/cn";

export const HoverCard = Root;
export const HoverCardTrigger = Trigger;

export const HoverCardContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Portal>
    <Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "bg-bg border-border data-[state=open]:animate-fade-in-up z-50 w-64 rounded-md border p-4 shadow-md",
        className,
      )}
      {...props}
    />
  </Portal>
));
HoverCardContent.displayName = "HoverCardContent";
