import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { SkeletonProps, SkeletonVariant } from "@/types/ui/Skeleton-types";

const variants: Record<SkeletonVariant, string> = {
  default: "bg-surface-hover",
  shiny: "bg-gradient-to-r from-blue-500 to-purple-500",
  glass: "bg-white/20",
  neon: "bg-cyan-500/30",
  gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
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
