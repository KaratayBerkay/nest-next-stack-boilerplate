"use client";

import { Badge } from "@/components/ui/Badge";
import type { StatusBadgeProps } from "@/types/views/settings/StatusBadge-types";

export function StatusBadge({
  status,
  paidLabel,
  unpaidLabel,
}: StatusBadgeProps) {
  const isPaid = status === "COMPLETED";
  return (
    <Badge variant={isPaid ? "success" : "error"} pill>
      {isPaid ? paidLabel : unpaidLabel}
    </Badge>
  );
}
