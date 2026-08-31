"use client";

import type { FormFieldInfoProps } from "@/types/ui/FormFieldInfo-types";

function toErrorString(err: unknown): string | undefined {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err)
    return String(err.message);
  return undefined;
}

export function FormFieldInfo(props: FormFieldInfoProps) {
  const { field, hint } = props;
  const error = toErrorString(field.state.meta.errors[0]);
  const isValidating = field.state.meta.isValidating;

  if (!error && !isValidating && !hint) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-1 flex items-center gap-1"
    >
      {isValidating && (
        <span className="text-muted inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {error && <p className="text-error text-xs">{error}</p>}
      {!error && !isValidating && hint && (
        <p className="text-muted text-xs">{hint}</p>
      )}
    </div>
  );
}
