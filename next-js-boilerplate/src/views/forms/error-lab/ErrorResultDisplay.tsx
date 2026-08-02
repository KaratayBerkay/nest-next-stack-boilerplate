"use client";

import type { ErrorResultDisplayProps } from "@/types/views/forms/ErrorResultDisplay-types";

export function ErrorResultDisplay({ result, label }: ErrorResultDisplayProps) {
  if (!result) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium">{label}</p>
      <pre className="surface border-border text-xxs overflow-auto rounded-lg border p-4">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
