"use client";

import { Button } from "@/components/ui/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";

interface DismissibleAlertSectionProps {
  alertVariant: "default" | "info" | "success" | "warning" | "error";
  onVariantChange: (v: "default" | "info" | "success" | "warning" | "error") => void;
  dismissed: boolean;
  onDismiss: () => void;
  onReset: () => void;
}

const variants = ["default", "info", "success", "warning", "error"] as const;

const titles: Record<string, string> = {
  default: "Note",
  info: "Information",
  error: "Error",
  success: "Success",
  warning: "Warning",
};

const descriptions: Record<string, string> = {
  default: "This is a neutral message.",
  info: "This is an informational message.",
  error: "Something went wrong. Please try again.",
  success: "Operation completed successfully.",
  warning: "Please review your input before continuing.",
};

export function DismissibleAlertSection({
  alertVariant,
  onVariantChange,
  dismissed,
  onDismiss,
  onReset,
}: DismissibleAlertSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Dismissible Alert</h3>
      {dismissed ? (
        <div className="flex flex-col gap-3">
          <p className="text-muted text-sm">Alert was dismissed.</p>
          <Button onClick={onReset} className="w-fit">
            Reset
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <Button
                key={v}
                size="sm"
                variant={alertVariant === v ? "default" : "outline"}
                onClick={() => onVariantChange(v)}
              >
                {v}
              </Button>
            ))}
          </div>
          <Alert variant={alertVariant}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <AlertTitle>{titles[alertVariant]}</AlertTitle>
                <AlertDescription>{descriptions[alertVariant]}</AlertDescription>
              </div>
              <button
                onClick={onDismiss}
                className="hover:bg-surface-hover inline-flex size-10 shrink-0 items-center justify-center rounded-md transition-colors"
                aria-label="Dismiss"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </Alert>
        </div>
      )}
    </section>
  );
}
