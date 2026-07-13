import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { SkeletonProps, SkeletonVariant } from "@/types/ui/Skeleton-types";

const variants: Record<SkeletonVariant, string> = {
  default: "bg-surface-hover",
};

export function Skeleton({
  className,
  variant,
  ...props
}: SkeletonProps) {
  const effectiveVariant = useComponentVariant(variant);
  const variantClass = variants[effectiveVariant as keyof typeof variants];

  return (
    <div
      className={cn(
        "animate-pulse rounded",
        variantClass,
        className,
      )}
      {...props}
    />
  );
}
