"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { PopupAlertsExample } from "@/views/ui/alert/PopupAlertsExample";
import type { AlertVariant } from "@/types/ui/Alert-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function ComponentsTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Alert variant="default">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components to your app using the CLI.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Info</h3>
        <Alert variant="info">
          <AlertTitle>Scheduled maintenance</AlertTitle>
          <AlertDescription>
            The service will be briefly unavailable on Sunday at 02:00 UTC.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Success</h3>
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your changes have been saved successfully.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Warning</h3>
        <Alert variant="warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Your subscription will expire in 7 days.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Error</h3>
        <Alert variant="error">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Your session has expired. Please log in again.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}

function ExamplesTab() {
  const [dismissed, setDismissed] = useState(false);
  const [alertVariant, setAlertVariant] = useState<
    "default" | "info" | "success" | "warning" | "error"
  >("default");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Dismissible Alert</h3>
        {dismissed ? (
          <div className="flex flex-col gap-3">
            <p className="text-muted text-sm">Alert was dismissed.</p>
            <Button onClick={() => setDismissed(false)} className="w-fit">
              Reset
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {(
                ["default", "info", "success", "warning", "error"] as const
              ).map((v) => (
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
                    {alertVariant === "default" && "Note"}
                    {alertVariant === "info" && "Information"}
                    {alertVariant === "error" && "Error"}
                    {alertVariant === "success" && "Success"}
                    {alertVariant === "warning" && "Warning"}
                  </AlertTitle>
                  <AlertDescription>
                    {alertVariant === "default" &&
                      "This is a neutral message."}
                    {alertVariant === "info" &&
                      "This is an informational message."}
                    {alertVariant === "error" &&
                      "Something went wrong. Please try again."}
                    {alertVariant === "success" &&
                      "Operation completed successfully."}
                    {alertVariant === "warning" &&
                      "Please review your input before continuing."}
                  </AlertDescription>
                </div>
                <button
                  onClick={() => setDismissed(true)}
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

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Status Alerts</h3>
        <div className="flex flex-col gap-3">
          <Alert variant="success">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <AlertTitle>Deployment Complete</AlertTitle>
            </div>
            <AlertDescription>
              Your application has been deployed to production successfully.
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <AlertTitle>High Memory Usage</AlertTitle>
            </div>
            <AlertDescription>
              Server memory usage is at 87%. Consider scaling up.
            </AlertDescription>
          </Alert>
          <Alert variant="error">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" x2="9" y1="9" y2="15" />
                <line x1="9" x2="15" y1="9" y2="15" />
              </svg>
              <AlertTitle>Build Failed</AlertTitle>
            </div>
            <AlertDescription>
              TypeScript compilation error in src/utils/parser.ts.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </div>
  );
}

function ServerRetryTab() {
  const [status, setStatus] = useState<"idle" | "active" | "dismissing" | "dismissed">("idle");
  const [countdown, setCountdown] = useState(30);
  const [retryCount, setRetryCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(30);
  const startTimeRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const remaining = Math.max(0, remainingRef.current - elapsed);
    setCountdown(remaining);
    if (remaining <= 0) {
      clearTimer();
      setStatus((prev) => (prev === "active" ? "dismissing" : prev));
    }
  }, [clearTimer]);

  const startTimer = useCallback(() => {
    remainingRef.current = 30;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(tick, 100);
  }, [tick]);

  const handleSimulate = useCallback(() => {
    setStatus("active");
    setCountdown(30);
    setRetryCount(0);
    startTimer();
  }, [startTimer]);

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current === null && remainingRef.current > 0) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(tick, 100);
    }
  }, [tick]);

  const handleRetry = useCallback(() => {
    setStatus("active");
    setCountdown(30);
    setRetryCount((c) => c + 1);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return (
    <div className="flex flex-col gap-6">
      {status === "idle" && (
        <div className="flex flex-col gap-4">
          <div className="border-border rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="bg-success size-2 rounded-full" />
              <span className="text-sm font-medium">api.example.com</span>
              <Badge variant="success" size="sm">Healthy</Badge>
            </div>
            <div className="text-muted grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="mb-0.5 font-medium uppercase tracking-wider opacity-60">Latency</div>
                <div>42ms</div>
              </div>
              <div>
                <div className="mb-0.5 font-medium uppercase tracking-wider opacity-60">Uptime</div>
                <div>99.98%</div>
              </div>
              <div>
                <div className="mb-0.5 font-medium uppercase tracking-wider opacity-60">Last Check</div>
                <div>Just now</div>
              </div>
            </div>
          </div>
          <p className="text-muted text-sm">
            Simulate a server outage to see the auto-retry behavior with
            countdown and exponential backoff.
          </p>
          <Button onClick={handleSimulate} variant="destructive" className="w-fit">
            Simulate Server Outage
          </Button>
        </div>
      )}

      {(status === "active" || status === "dismissing") && (
        <div
          className={cn(
            "sticky top-0 z-10",
            status === "active" && "animate-fade-in-up",
            status === "dismissing" && "animate-fade-out",
          )}
          onAnimationEnd={() => {
            if (status === "dismissing") {
              setStatus("dismissed");
            }
          }}
        >
          <Alert
            variant="error"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-start gap-3">
              <Badge variant="error" size="sm" className="mt-0.5 shrink-0">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="1" x2="23" y1="1" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" x2="12.01" y1="20" y2="20" />
                </svg>
              </Badge>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTitle>Connection lost to api.example.com</AlertTitle>
                </div>
                <div className="text-muted space-y-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-error">ERR_CONNECTION_REFUSED</span>
                    <span>·</span>
                    <span>Attempt {retryCount + 1} of 5</span>
                  </div>
                  <p>
                    Unable to reach the API server at{" "}
                    <code className="bg-error/10 rounded px-1 py-0.5 font-mono">
                      https://api.example.com/health
                    </code>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Spinner size="xs" />
                    <span className="tabular-nums text-sm font-medium">
                      Retrying in {countdown}s…
                    </span>
                  </div>
                  {status === "dismissing" && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleRetry}
                      className="h-auto p-0 text-xs font-medium"
                    >
                      Retry now
                    </Button>
                  )}
                </div>
                <div className="bg-error/10 mt-1 h-1 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-error h-full transition-[width] duration-100 ease-linear"
                    style={{ width: `${((30 - countdown) / 30) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Alert>
        </div>
      )}

      {status === "dismissed" && (
        <div className="flex flex-col gap-4">
          <div className="border-border rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="bg-error size-2 rounded-full" />
              <span className="text-sm font-medium">api.example.com</span>
              <Badge variant="error" size="sm">Down</Badge>
            </div>
            <div className="text-muted grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="mb-0.5 font-medium uppercase tracking-wider opacity-60">Attempts</div>
                <div>{retryCount + 1} failed</div>
              </div>
              <div>
                <div className="mb-0.5 font-medium uppercase tracking-wider opacity-60">Last Error</div>
                <div>Connection refused</div>
              </div>
              <div>
                <div className="mb-0.5 font-medium uppercase tracking-wider opacity-60">Status</div>
                <div className="text-error">Exhausted</div>
              </div>
            </div>
          </div>
          <p className="text-muted text-sm">
            All retry attempts failed. The server is currently unreachable.
          </p>
          <Button onClick={handleRetry} variant="destructive" className="w-fit">
            Restart Health Check
          </Button>
        </div>
      )}
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Form Error Summary",
    description: "Error variant alert listing invalid fields.",
    render: () => <ComponentsTab />,
  },
  {
    id: "variants",
    title: "Success Notice",
    description: "Success variant alert with auto icon.",
    render: () => <ExamplesTab />,
  },
  {
    id: "server-retry",
    title: "Server Retry",
    description: "Error alert with countdown, sticky positioning, and auto-dismiss.",
    render: () => <ServerRetryTab />,
  },
  {
    id: "popup-alerts",
    title: "Pop-up Alerts",
    description:
      "Button-triggered overlay alerts with 30-second auto-dismiss countdowns.",
    render: () => <PopupAlertsExample />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "info", "success", "warning", "error"]}
        sizes={[]}
        render={(variant, _size) => (
          <Alert variant={variant as AlertVariant}>
            <AlertTitle>Alert Title</AlertTitle>
            <AlertDescription>This is a {variant} variant alert.</AlertDescription>
          </Alert>
        )}
      />
    ),
  },
];

export default function AlertPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Alert"
      intro="Displays a callout for user attention with multiple variants."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
