"use client";

import React from "react";
import { cn } from "@/lib/cn";
import type { AvatarGroupProps } from "@/types/ui/Avatar-types";

export function AvatarGroup({
  children,
  max = 4,
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
        <div className="bg-surface text-muted ring-bg inline-flex size-10 items-center justify-center rounded-full text-xs font-medium ring-2">
          +{overflow}
        </div>
      )}
    </div>
  );
}
