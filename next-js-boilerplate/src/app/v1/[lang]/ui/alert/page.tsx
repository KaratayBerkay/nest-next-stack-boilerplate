"use client";

import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export default function AlertPage() {
  const [dismissed, setDismissed] = useState(false);
  const [alertVariant, setAlertVariant] = useState<"default" | "destructive" | "success" | "warning">("default");

  if (dismissed) {
    return (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Dismissed</h3>
          <p className="text-muted text-sm">Alert was dismissed.</p>
          <Button onClick={() => setDismissed(false)} className="w-fit">
            Reset
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Alert</h2>
      <p className="text-muted text-sm">
        Displays a callout for user attention.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Alert variant="default" data-testid="alert-default">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components to your app using the CLI.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Destructive</h3>
        <Alert variant="destructive" data-testid="alert-destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Your session has expired. Please log in again.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Success</h3>
        <Alert variant="success" data-testid="alert-success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your changes have been saved successfully.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Warning</h3>
        <Alert variant="warning" data-testid="alert-warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Your subscription will expire in 7 days.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Usage Example</h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {(["default", "success", "warning", "destructive"] as const).map((v) => (
              <Button
                key={v}
                size="sm"
                variant={alertVariant === v ? "default" : "outline"}
                onClick={() => setAlertVariant(v)}
              >
                {v}
              </Button>
            ))}
          </div>
          <Alert variant={alertVariant}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <AlertTitle>
                  {alertVariant === "default" && "Information"}
                  {alertVariant === "destructive" && "Error"}
                  {alertVariant === "success" && "Success"}
                  {alertVariant === "warning" && "Warning"}
                </AlertTitle>
                <AlertDescription>
                  {alertVariant === "default" && "This is an informational message."}
                  {alertVariant === "destructive" && "Something went wrong. Please try again."}
                  {alertVariant === "success" && "Operation completed successfully."}
                  {alertVariant === "warning" && "Please review your input before continuing."}
                </AlertDescription>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-muted hover:text-fg shrink-0 rounded p-1 transition-colors"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </Alert>
        </div>
      </section>
    </div>
  );
}
