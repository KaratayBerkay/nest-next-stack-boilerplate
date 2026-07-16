"use client";

import { forwardRef } from "react";
import { Header, Trigger } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants, type GlobalVariant } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

const accordionTriggerVariants = {
  ...globalStyleVariants,
  default: "text-fg",
};

export const AccordionTrigger = forwardRef<
  React.ElementRef<typeof Trigger>,
  React.ComponentPropsWithoutRef<typeof Trigger> & { variant?: GlobalVariant }
>(({ className, children, value, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Header className="flex">
      <Trigger
        ref={ref}
        value={value}
        className={cn(
          "flex flex-1 items-center justify-between py-4 px-4 text-sm font-medium transition-colors hover:text-brand",
          resolveVariant(accordionTriggerVariants, effectiveVariant),
          className,
        )}
        {...props}
      >
        {children}
      </Trigger>
    </Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";
