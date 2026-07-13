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
  variant?: "default" | "shiny" | "glass" | "neon" | "gradient";
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
      variant = "default",
      triggerFontSize = "text-sm",
      triggerFontWeight = "font-medium",
      triggerFontFamily = "font-sans",
      contentFontSize = "text-sm",
      contentFontWeight = "font-normal",
      contentFontFamily = "font-sans",
    },
    ref,
  ) => {
    const variants = {
      default: "border-border border-b",
      shiny: "border-slate-700/50 border-b hover:border-slate-600 transition-colors",
      glass: "border-white/10 border-b hover:border-white/20 transition-colors",
      neon: "border-cyan-500/30 border-b hover:border-cyan-400/50 transition-colors",
      gradient: "border-transparent border-b hover:border-slate-700 transition-colors",
    };

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
        className={cn(variants[variant], "group")}
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
