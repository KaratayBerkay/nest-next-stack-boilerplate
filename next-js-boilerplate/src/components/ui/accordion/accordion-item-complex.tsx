"use client";

import { forwardRef } from "react";
import { Item } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";
export type AccordionUpperSectionProps = React.HTMLAttributes<HTMLDivElement>;

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
  variant?: "default";
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
      triggerFontSize = "text-sm",
      triggerFontWeight = "font-medium",
      triggerFontFamily = "font-sans",
      contentFontSize = "text-sm",
      contentFontWeight = "font-normal",
      contentFontFamily = "font-sans",
    },
    ref,
  ) => {
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
        className={cn("border-border border-b", "group")}
      >
        <div className="flex flex-col">
          <div className="flex flex-1 items-center justify-between py-4 transition-all">
            <span className={triggerClasses}>{trigger}</span>
          </div>
          {upper && <AccordionUpperSection>{upper}</AccordionUpperSection>}
          <div className={cn("overflow-hidden", contentClasses)}>
            <div className="pb-4 pl-2 pr-4">{content}</div>
          </div>
        </div>
      </Item>
    );
  },
);
AccordionItemComplex.displayName = "AccordionItemComplex";
