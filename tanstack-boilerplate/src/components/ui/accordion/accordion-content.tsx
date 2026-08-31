"use client";

import { forwardRef } from "react";
import { Content } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";

export const AccordionContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & { variant?: "default" }
>(({ className, children, ...props }, ref) => {
  return (
    <Content
      ref={ref}
      className={cn(
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        "overflow-hidden text-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-[state=open]:bg-surface-hover",
        className,
      )}
      {...props}
    >
      <div className="text-muted px-4 pt-2 pb-4">{children}</div>
    </Content>
  );
});
AccordionContent.displayName = "AccordionContent";
