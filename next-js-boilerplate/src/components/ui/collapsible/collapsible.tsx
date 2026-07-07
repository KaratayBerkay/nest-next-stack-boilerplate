"use client";
import { forwardRef } from "react";
import { Root, Trigger, Content } from "@radix-ui/react-collapsible";
import { cn } from "@/lib/cn";

export const Collapsible = Root as React.FC<React.ComponentPropsWithoutRef<typeof Root>>;

export const CollapsibleTrigger = forwardRef<React.ElementRef<typeof Trigger>, React.ComponentPropsWithoutRef<typeof Trigger>>(({ className, ...props }, ref) => <Trigger ref={ref} className={cn(className)} {...props} />);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

export const CollapsibleContent = forwardRef<React.ElementRef<typeof Content>, React.ComponentPropsWithoutRef<typeof Content>>(({ className, ...props }, ref) => <Content ref={ref} className={cn("data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden", className)} {...props} />);
CollapsibleContent.displayName = "CollapsibleContent";
