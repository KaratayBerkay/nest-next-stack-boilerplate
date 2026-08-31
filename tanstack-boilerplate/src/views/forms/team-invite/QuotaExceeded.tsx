"use client";

import { Button } from "@/components/ui/Button";
import type { QuotaExceededProps } from "@/types/views/forms/QuotaExceeded-types";

export function QuotaExceeded({
  heading,
  quotaTitle,
  quotaBody,
  backLabel,
  onReset,
}: QuotaExceededProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold">{heading}</h2>
      <div className="surface border-border flex flex-col items-center gap-4 rounded-lg border p-8 text-center">
        <h3 className="text-base font-semibold">{quotaTitle}</h3>
        <p className="text-muted text-xs">{quotaBody}</p>
        <Button onClick={onReset}>{backLabel}</Button>
      </div>
    </div>
  );
}
