"use client";

import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { SkeletonProps, SkeletonVariant } from "@/types/ui/Skeleton-types";

const variants: Record<SkeletonVariant, string> = {
  ...globalStyleVariants,
  default: "bg-surface-hover",
};

export function Skeleton({
  className,
  variant,
  ...props
}: SkeletonProps) {
  const effectiveVariant = useComponentVariant(variant);
  const variantClass = resolveVariant(variants, effectiveVariant);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded motion-reduce:animate-none",
        variantClass,
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-bg/60 to-transparent motion-reduce:animate-none" />
    </div>
  );
}
