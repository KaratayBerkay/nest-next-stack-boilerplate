"use client";

import { forwardRef } from "react";
import { Item } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";

export const AccordionItem = forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item>
>(({ className, ...props }, ref) => {
  return (
    <Item
      ref={ref}
      className={cn(
        "border-border border-b",
        "bg-surface hover:bg-surface-hover data-[state=open]:bg-surface-hover",
        "transition-colors duration-200",
        className,
      )}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";
