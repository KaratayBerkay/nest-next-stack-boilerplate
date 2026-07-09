"use client";

import { useEffect } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { V1ErrorProps } from "@/types/v1/V1Error-types";

// Custom error boundary for the `/v1/[lang]` segment. Must be a Client Component.
// It catches errors thrown while rendering any page under this version+locale and
// renders a fallback instead of crashing the route; `reset()` retries rendering
// the segment. `digest` is a server-side hash React attaches to production errors
// so you can correlate the message with your logs.
export default function V1Error({
  error,
  reset,
}: V1ErrorProps) {
  const t = useMessages("error");
  useEffect(() => {
    // Report to your observability pipeline here (see /observability, F33).
    console.error("[v1] segment error:", error);
  }, [error]);

  return (
    <div data-testid="error-boundary" className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-red-600">
        {t.somethingWentWrongV1}
      </h2>
      <p data-testid="error-message" className="text-muted text-sm">
        {error.message}
      </p>
      {error.digest ? (
        <p className="text-xs text-zinc-500">
          {t.reference}: <code data-testid="error-digest">{error.digest}</code>
        </p>
      ) : null}
      <button
        type="button"
        data-testid="error-reset"
        className="text-brand self-start underline"
        onClick={() => reset()}
      >
        {t.tryAgain}
      </button>
    </div>
  );
}
