"use client";
import { forwardRef } from "react";
import { Root, Indicator } from "@radix-ui/react-progress";
import { cn } from "@/lib/cn";

export const Progress = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, value, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn(
      "bg-surface relative h-2 w-full overflow-hidden rounded-full",
      className,
    )}
    {...props}
  >
    <Indicator
      className="bg-brand h-full w-full flex-1 transition-all"
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </Root>
));
Progress.displayName = "Progress";
