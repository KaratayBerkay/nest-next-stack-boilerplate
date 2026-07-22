"use client";

import { Button } from "@/components/ui/Button";

interface QuotaExceededProps {
  heading: string;
  quotaTitle: string;
  quotaBody: string;
  onReset: () => void;
}

export function QuotaExceeded({
  heading,
  quotaTitle,
  quotaBody,
  onReset,
}: QuotaExceededProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold">{heading}</h2>
      <div className="surface border-border flex flex-col items-center gap-4 rounded-lg border p-8 text-center">
        <h3 className="text-base font-semibold">{quotaTitle}</h3>
        <p className="text-muted text-xs">{quotaBody}</p>
        <Button onClick={onReset}>Back</Button>
      </div>
    </div>
  );
}
