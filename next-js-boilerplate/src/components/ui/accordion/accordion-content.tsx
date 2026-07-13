"use client";

import { forwardRef } from "react";
import { Content } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";

export const AccordionContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & { variant?: "default" | "shiny" | "glass" | "neon" | "gradient" }
>(({ className, children, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  const variants = {
    default: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    shiny: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    glass: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    neon: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    gradient: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
  };

  return (
    <Content
      ref={ref}
      className={cn(
        variants[effectiveVariant as keyof typeof variants],
        "overflow-hidden text-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        className,
      )}
      {...props}
    >
      <div className="pt-0 pb-4 pl-2 pr-4">{children}</div>
    </Content>
  );
});
AccordionContent.displayName = "AccordionContent";
