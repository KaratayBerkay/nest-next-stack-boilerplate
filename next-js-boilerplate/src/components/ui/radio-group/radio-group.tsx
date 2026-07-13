"use client";
import { forwardRef } from "react";
import { Root, Item, Indicator } from "@radix-ui/react-radio-group";
import { cn } from "@/lib/cn";
import type { RadioGroupProps, RadioGroupItemProps, RadioGroupVariant } from "@/types/ui/RadioGroup-types";

const variants: Record<RadioGroupVariant, string> = {
  default: "text-fg",
  shiny: "text-white",
  glass: "text-white",
  neon: "text-cyan-400",
  gradient: "text-transparent bg-clip-text",
};

export const RadioGroup = forwardRef<
  React.ElementRef<typeof Root>,
  RadioGroupProps
>(({ className, fontSize, fontWeight, fontFamily, ...props }, ref) => {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <Root
      ref={ref}
      className={cn(
        "grid gap-2",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
});
RadioGroup.displayName = "RadioGroup";

export const RadioGroupItem = forwardRef<
  React.ElementRef<typeof Item>,
  RadioGroupItemProps
>(({ className, fontSize, fontWeight, fontFamily, ...props }, ref) => {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <Item
      ref={ref}
      className={cn(
        "border-border text-brand focus-visible:ring-brand aspect-square h-4 w-4 rounded-full border focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Indicator className="flex items-center justify-center">
        <span className="bg-brand h-2 w-2 rounded-full" />
      </Indicator>
    </Item>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";
