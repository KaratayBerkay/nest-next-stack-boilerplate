"use client";
import { forwardRef } from "react";
import { Root, Indicator } from "@radix-ui/react-progress";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { ProgressProps, ProgressVariant } from "@/types/ui/Progress-types";

const barVariants: Record<ProgressVariant, string> = {
  ...globalStyleVariants,
  default: "bg-brand",
};

const trackVariants: Record<ProgressVariant, string> = {
  ...globalStyleVariants,
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
        resolveVariant(trackVariants, effectiveVariant),
        className,
      )}
      {...props}
    >
      <Indicator
        className={cn(
          "h-full w-full flex-1 transition-transform duration-500 ease-out",
          resolveVariant(barVariants, effectiveVariant),
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </Root>
  );
});
Progress.displayName = "Progress";
