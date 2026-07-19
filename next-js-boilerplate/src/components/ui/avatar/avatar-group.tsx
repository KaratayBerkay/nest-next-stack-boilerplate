import React from "react";
import { cn } from "@/lib/cn";
import type {
  AvatarGroupProps,
  AvatarGroupSize,
} from "@/types/ui/Avatar-types";

const overflowSizes: Record<AvatarGroupSize, string> = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
};

export function AvatarGroup({
  children,
  max = 4,
  size = "md",
  className,
}: AvatarGroupProps) {
  const items = React.Children.toArray(children);
  const visible = items.slice(0, max);
  const overflow = items.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((child, i) => (
        <div key={i} className="ring-bg ring-2">
          {child}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "bg-surface text-muted ring-bg inline-flex items-center justify-center rounded-full text-xs font-medium ring-2",
            overflowSizes[size],
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
