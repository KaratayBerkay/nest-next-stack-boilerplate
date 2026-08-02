"use client";

import { cn } from "@/lib/cn";
import type { StatusBadgeProps } from "@/types/views/settings/StatusBadge-types";

export function StatusBadge({
  status,
  paidLabel,
  unpaidLabel,
}: StatusBadgeProps) {
  const isPaid = status === "COMPLETED";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isPaid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
      )}
    >
      {isPaid ? paidLabel : unpaidLabel}
    </span>
  );
}
