"use client";

import type { StateCardProps } from "@/types/forms/StateCard-types";

export function StateCard({ label, children }: StateCardProps) {
  return (
    <div className="surface border-border flex flex-col gap-2 rounded-lg border p-4">
      <p className="text-xxs text-muted tracking-wider uppercase">{label}</p>
      {children}
    </div>
  );
}
