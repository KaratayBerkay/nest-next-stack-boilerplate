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

const sizeMap = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
} as const;

export const Progress = forwardRef<
  React.ElementRef<typeof Root>,
  ProgressProps
>(
  (
    {
      className,
      variant,
      value,
      indeterminate,
      size = "md",
      showValueLabel,
      ...props
    },
    ref,
  ) => {
    const effectiveVariant = useComponentVariant(variant);
    return (
      <div className="flex items-center gap-2">
        <Root
          ref={ref}
          aria-label="Progress"
          className={cn(
            "relative w-full overflow-hidden rounded-full motion-reduce:animate-none",
            sizeMap[size],
            indeterminate && "animate-pulse",
            resolveVariant(trackVariants, effectiveVariant),
            className,
          )}
          {...props}
        >
          <Indicator
            className={cn(
              "h-full w-full flex-1 transition-transform duration-500 ease-out",
              indeterminate && "animate-progress-indeterminate",
              resolveVariant(barVariants, effectiveVariant),
            )}
            style={
              indeterminate
                ? undefined
                : { transform: `translateX(-${100 - (value ?? 0)}%)` }
            }
          />
        </Root>
        {showValueLabel && value !== undefined && !indeterminate && (
          <span className="text-muted shrink-0 text-xs tabular-nums">
            {value}%
          </span>
        )}
      </div>
    );
  },
);
Progress.displayName = "Progress";
