"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/features/statics";
import type { V1ErrorProps } from "@/types/v1/V1Error-types";
import { eventLogger } from "@/lib/event-logger";

export default function V1Error({ error, reset }: V1ErrorProps) {
  useEffect(() => {
    console.error("[v1] segment error:", error);
    // Next.js segment-boundary errors don't reach window.onerror (React
    // swallows them before they bubble), so useEventLogger's global handler
    // never sees these — this is the only place they can ship to the pipeline.
    eventLogger.emit({
      eventType: "exception",
      url: window.location.pathname,
      category: "application-exception",
      event: "segment.error",
      exceptionType: "CLIENT_ERROR",
      metadata: {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      },
    });
  }, [error]);

  return (
    <div
      data-testid="error-boundary"
      className="surface flex flex-col gap-2 p-5"
    >
      <ErrorPage error={error} reset={reset} />
    </div>
  );
}
