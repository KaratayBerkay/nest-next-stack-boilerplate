"use client";

import { forwardRef } from "react";
import { Item, Header, Trigger, Content } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

export type AccordionUpperSectionProps = React.HTMLAttributes<HTMLDivElement>;

const accordionComplexVariants = {
  ...globalStyleVariants,
  default: "text-fg",
};

export const AccordionUpperSection = forwardRef<
  HTMLDivElement,
  AccordionUpperSectionProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("pt-2 pb-3 px-4", className)}
    {...props}
  />
));
AccordionUpperSection.displayName = "AccordionUpperSection";

export type AccordionItemComplexProps = {
  value: string;
  trigger: React.ReactNode;
  upper?: React.ReactNode;
  content: React.ReactNode;
  variant?: string;
  triggerFontSize?: string;
  triggerFontWeight?: string;
  triggerFontFamily?: string;
  contentFontSize?: string;
  contentFontWeight?: string;
  contentFontFamily?: string;
};

export const AccordionItemComplex = forwardRef<
  React.ElementRef<typeof Item>,
  AccordionItemComplexProps
>(
  (
    {
      value,
      trigger,
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

    return (
      <Item
        ref={ref}
        value={value}
        className="border-border border-b group"
      >
        <div className="flex flex-col">
          <Header className="flex">
            <Trigger
              className={cn(
                "flex flex-1 items-center justify-between py-4 transition-all",
                "hover:text-brand",
                "[&[data-state=open]>svg]:rotate-180",
                resolveVariant(accordionComplexVariants, effectiveVariant),
                triggerClasses,
              )}
            >
              {trigger}
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
          {upper && <AccordionUpperSection>{upper}</AccordionUpperSection>}
          <Content
            className={cn(
              "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
              "overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              contentClasses,
            )}
          >
            <div className="pb-4 pl-2 pr-4">{content}</div>
          </Content>
        </div>
      </Item>
    );
  },
);
AccordionItemComplex.displayName = "AccordionItemComplex";
