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
    <Header className="flex group">
      <Trigger
        ref={ref}
        value={value}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-colors hover:text-brand [&[data-state=open]>svg]:rotate-180",
          resolveVariant(accordionTriggerVariants, effectiveVariant),
          className,
        )}
        {...props}
      >
        {children}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted size-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Trigger>
    </Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";
