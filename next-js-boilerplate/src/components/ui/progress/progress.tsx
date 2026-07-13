"use client";
import { forwardRef } from "react";
import { Root, Indicator } from "@radix-ui/react-progress";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { ProgressProps, ProgressVariant } from "@/types/ui/Progress-types";

const barVariants: Record<ProgressVariant, string> = {
  default: "bg-brand",
};

const trackVariants: Record<ProgressVariant, string> = {
  default: "bg-surface",
};

export const Progress = forwardRef<
  React.ElementRef<typeof Root>,
  ProgressProps
>(({ className, variant, value, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        trackVariants[effectiveVariant as keyof typeof trackVariants],
        className,
      )}
      {...props}
    >
      <Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          barVariants[effectiveVariant as keyof typeof barVariants],
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </Root>
  );
});
Progress.displayName = "Progress";
