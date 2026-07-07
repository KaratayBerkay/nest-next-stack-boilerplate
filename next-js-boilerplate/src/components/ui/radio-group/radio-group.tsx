"use client";
import { forwardRef } from "react";
import { Root, Item, Indicator } from "@radix-ui/react-radio-group";
import { cn } from "@/lib/cn";

export const RadioGroup = forwardRef<React.ElementRef<typeof Root>, React.ComponentPropsWithoutRef<typeof Root>>(({ className, ...props }, ref) => <Root ref={ref} className={cn("grid gap-2", className)} {...props} />);
RadioGroup.displayName = "RadioGroup";

export const RadioGroupItem = forwardRef<React.ElementRef<typeof Item>, React.ComponentPropsWithoutRef<typeof Item>>(({ className, ...props }, ref) => (
  <Item ref={ref} className={cn("border-border text-brand focus-visible:ring-brand aspect-square h-4 w-4 rounded-full border focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
    <Indicator className="flex items-center justify-center">
      <span className="bg-brand h-2 w-2 rounded-full" />
    </Indicator>
  </Item>
));
RadioGroupItem.displayName = "RadioGroupItem";
