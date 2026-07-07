"use client";

import { forwardRef } from "react";
import { Content } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";

export const AccordionContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className, children, ...props }, ref) => (
  <Content
    ref={ref}
    className={cn(
      "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm",
      className,
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </Content>
));
AccordionContent.displayName = "AccordionContent";
