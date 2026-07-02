"use client";

import { useEffect, useRef } from "react";
import { eventLogger } from "@/lib/event-logger";

/**
 * Hook that automatically captures page navigation events and unhandled errors.
 */
export function useEventLogger(): void {
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // --- Page view tracking ---
    const currentPath = window.location.pathname;
    if (currentPath !== prevPath.current) {
      prevPath.current = currentPath;
      eventLogger.emit({
        eventType: "page.view",
        url: currentPath,
        userAgent: navigator.userAgent,
      });
    }

    // --- Unhandled errors ---
    const onError = (event: ErrorEvent) => {
      eventLogger.emit({
        eventType: "error",
        metadata: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      eventLogger.emit({
        eventType: "error",
        metadata: {
          reason:
            event.reason instanceof Error
              ? event.reason.message
              : String(event.reason),
        },
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
}
