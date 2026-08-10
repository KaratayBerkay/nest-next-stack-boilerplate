"use client";

import type { ReviewStepProps } from "@/types/views/forms/ReviewStep-types";
import { getRoleOptions } from "./config";

export function ReviewStep({ emails, role, message, t }: ReviewStepProps) {
  const roleOptions = getRoleOptions(t as Record<string, string>);
  return (
    <div className="surface border-border flex flex-col gap-2 rounded-lg border p-4">
      <p className="text-xs font-semibold">{t.stepReview as string}</p>
      <div className="flex flex-col gap-1 text-xs">
        <span>
          {t.emails as string}: {emails.join(", ")}
        </span>
        <span>
          {t.role as string}:{" "}
          {roleOptions.find((r) => r.value === role)?.label ?? role}
        </span>
        {message && (
          <span>
            {t.message as string}: {message}
          </span>
        )}
      </div>
    </div>
  );
}
