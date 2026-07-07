"use client";

import { forwardRef } from "react";
import { Item } from "@radix-ui/react-accordion";
import { cn } from "@/lib/cn";

export const AccordionItem = forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item>
>(({ className, ...props }, ref) => (
  <Item ref={ref} className={cn("border-border border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";
