"use client";

import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";
import type { EditableTableSaveAlertProps } from "@/types/forms/EditableTableSaveAlert-types";

const AUTO_DISMISS_MS = 4000;

export function EditableTableSaveAlert({
  result,
  onDone,
}: EditableTableSaveAlertProps) {
  const [closing, setClosing] = useState(false);
  const [depleted, setDepleted] = useState(false);

  // `result` is only ever a fresh object per save attempt, and the parent
  // remounts this component (via `key={result.id}`) for each one — so this
  // effect only needs to run once per mount, not react to prop changes.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDepleted(true));
    const dismissTimer = setTimeout(() => setClosing(true), AUTO_DISMISS_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(dismissTimer);
    };
  }, []);

  const isSuccess = result.variant === "success";

  return (
    <div
      className={closing ? "animate-fade-out" : "animate-fade-in-up"}
      onAnimationEnd={() => {
        if (closing) onDone();
      }}
    >
      <Alert variant={result.variant}>
        <div className="flex items-center gap-2">
          {isSuccess ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" x2="9" y1="9" y2="15" />
              <line x1="9" x2="15" y1="9" y2="15" />
            </svg>
          )}
          <AlertTitle>{result.title}</AlertTitle>
        </div>
        {result.description && (
          <AlertDescription>{result.description}</AlertDescription>
        )}
        <div
          className={cn(
            "mt-2 h-1 w-full overflow-hidden rounded-full",
            isSuccess ? "bg-success/10" : "bg-error/10",
          )}
        >
          <div
            className={cn(
              "h-full transition-[width] ease-linear",
              isSuccess ? "bg-success" : "bg-error",
            )}
            style={{
              width: depleted ? "0%" : "100%",
              transitionDuration: `${AUTO_DISMISS_MS}ms`,
            }}
          />
        </div>
      </Alert>
    </div>
  );
}
