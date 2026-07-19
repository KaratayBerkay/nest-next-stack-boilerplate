"use client";

import { forwardRef } from "react";
import { Item, Header, Trigger, Content } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { AccordionItemComplexProps } from "@/types/ui/Accordion-types";
import type { AccordionUpperSectionProps } from "@/types/ui/AccordionUpperSection-types";

const accordionComplexVariants = {
  ...globalStyleVariants,
  default: "text-fg",
};

export const AccordionUpperSection = forwardRef<
  HTMLDivElement,
  AccordionUpperSectionProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-4 pt-2 pb-3", className)} {...props} />
));
AccordionUpperSection.displayName = "AccordionUpperSection";

export const AccordionItemComplex = forwardRef<
  React.ElementRef<typeof Item>,
  AccordionItemComplexProps
>(
  (
    {
      value,
      trigger,
      leftSlot,
      centerSlot,
      rightSlot,
      upper,
      content,
      variant,
      triggerFontSize = "text-sm",
      triggerFontWeight = "font-medium",
      triggerFontFamily = "font-sans",
      contentFontSize = "text-sm",
      contentFontWeight = "font-normal",
      contentFontFamily = "font-sans",
    },
    ref,
  ) => {
    const effectiveVariant = useComponentVariant(variant);

    const triggerClasses = cn(
      triggerFontSize,
      triggerFontWeight,
      triggerFontFamily,
    );

    const contentClasses = cn(
      contentFontSize,
      contentFontWeight,
      contentFontFamily,
    );

    const hasFlexibleSlots = leftSlot || centerSlot || rightSlot;

    return (
      <Item
        ref={ref}
        value={value}
        className={cn(
          "border-border border-b",
          "bg-surface hover:bg-surface-hover data-[state=open]:bg-surface-hover",
          "transition-colors duration-200",
        )}
      >
        <div className="flex flex-col">
          <Header className="flex">
            <Trigger
              className={cn(
                "flex flex-1 items-center px-4 py-4 transition-all",
                "hover:text-brand",
                resolveVariant(accordionComplexVariants, effectiveVariant),
                triggerClasses,
              )}
            >
              {hasFlexibleSlots ? (
                <div className="flex flex-1 items-center gap-4">
                  {leftSlot && <div className="flex-shrink-0">{leftSlot}</div>}
                  <div className="min-w-0 flex-1">{centerSlot}</div>
                  {rightSlot && (
                    <div className="flex-shrink-0">{rightSlot}</div>
                  )}
                </div>
              ) : (
                trigger
              )}
            </Trigger>
          </Header>
          {upper && <AccordionUpperSection>{upper}</AccordionUpperSection>}
          <Content
            className={cn(
              "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
              "overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "data-[state=open]:bg-surface-hover",
              contentClasses,
            )}
          >
            <div className="px-4 pt-2 pb-4">{content}</div>
          </Content>
        </div>
      </Item>
    );
  },
);
AccordionItemComplex.displayName = "AccordionItemComplex";
