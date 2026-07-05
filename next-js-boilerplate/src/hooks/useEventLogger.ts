"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { eventLogger } from "@/lib/event-logger";

function getStack(err: unknown): string | undefined {
  if (err instanceof Error) return err.stack;
  return undefined;
}

export function useEventLogger(): void {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const enterTime = useRef<number>(0);

  useEffect(() => {
    if (enterTime.current === 0) enterTime.current = Date.now();

    const currentPath = pathname;
    const prev = prevPath.current;

    if (prev !== null && currentPath !== prev) {
      const durationMs = Date.now() - enterTime.current;
      eventLogger.emit({
        eventType: "page.exit",
        url: prev ?? undefined,
        userAgent: navigator.userAgent,
        category: "page",
        event: "page.exit",
        page: prev ?? undefined,
        durationMs,
        metadata: { durationMs },
      });
    }

    if (currentPath !== prev) {
      prevPath.current = currentPath;
      enterTime.current = Date.now();
      eventLogger.emit({
        eventType: "page.view",
        url: currentPath ?? undefined,
        userAgent: navigator.userAgent,
        category: "page",
        event: "page.view",
        page: currentPath ?? undefined,
      });
    }
  }, [pathname]);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      eventLogger.emit({
        eventType: "exception",
        url: window.location.pathname,
        category: "exception",
        event: "exception",
        exceptionType: "CLIENT_ERROR",
        metadata: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: getStack(event.error ?? event),
        },
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      eventLogger.emit({
        eventType: "exception",
        url: window.location.pathname,
        category: "exception",
        event: "exception",
        exceptionType: "CLIENT_REJECTION",
        metadata: {
          reason:
            event.reason instanceof Error
              ? event.reason.message
              : String(event.reason),
          stack: getStack(event.reason),
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
