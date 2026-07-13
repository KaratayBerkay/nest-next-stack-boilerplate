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
        "animate-pulse rounded motion-reduce:animate-none",
        variantClass,
        className,
      )}
      {...props}
    />
  );
}
