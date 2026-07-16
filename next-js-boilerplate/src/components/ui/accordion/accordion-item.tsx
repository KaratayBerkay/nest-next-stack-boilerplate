"use client";

import { forwardRef } from "react";
import { Item } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants, type GlobalVariant } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

const accordionItemVariants = {
  ...globalStyleVariants,
  default: "border-border",
};

export const AccordionItem = forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item> & { variant?: GlobalVariant }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Item
      ref={ref}
      className={cn(
        "border-b",
        resolveVariant(accordionItemVariants, effectiveVariant),
        className,
      )}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";
