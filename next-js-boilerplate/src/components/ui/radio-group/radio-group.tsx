"use client";
import { forwardRef } from "react";
import { Root, Item, Indicator } from "@radix-ui/react-radio-group";
import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type {
  RadioGroupProps,
  RadioGroupItemProps,
} from "@/types/ui/RadioGroup-types";

export const RadioGroup = forwardRef<
  React.ElementRef<typeof Root>,
  RadioGroupProps
>(({ className, fontSize, fontWeight, fontFamily, ...props }, ref) => {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <Root ref={ref} className={cn("grid gap-2", fonts, className)} {...props} />
  );
});
RadioGroup.displayName = "RadioGroup";

export const RadioGroupItem = forwardRef<
  React.ElementRef<typeof Item>,
  RadioGroupItemProps
>(({ className, fontSize, fontWeight, fontFamily, ...props }, ref) => {
  const _fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <Item
      ref={ref}
      className={cn(
        "border-border text-brand focus-visible:ring-brand aspect-square size-4.5 rounded-full border focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Indicator className="flex items-center justify-center">
        <span className="bg-brand animate-scale-in size-2 rounded-full" />
      </Indicator>
    </Item>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";
