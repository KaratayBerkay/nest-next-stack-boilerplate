"use client";

import { cn } from "@/lib/cn";
import type { PageHeaderProps } from "@/types/ui/PageHeader-types";

export function PageHeader({
  title,
  description,
  actions,
  as: Tag = "h1",
  titleClassName,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-4">
        <Tag className={cn("text-lg font-semibold", titleClassName)}>{title}</Tag>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="text-muted text-sm">{description}</p>
      )}
    </div>
  );
}
