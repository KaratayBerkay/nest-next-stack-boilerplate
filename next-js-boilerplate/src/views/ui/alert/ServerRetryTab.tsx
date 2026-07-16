"use client";

import { useState, useRef, useEffect } from "react";
import { Alert, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

function clearTimer(timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
}

function tick(
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  remainingRef: React.MutableRefObject<number>,
  startTimeRef: React.MutableRefObject<number>,
  setCountdown: React.Dispatch<React.SetStateAction<number>>,
  setStatus: React.Dispatch<React.SetStateAction<"idle" | "active" | "dismissing" | "dismissed">>,
) {
  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
  const remaining = Math.max(0, remainingRef.current - elapsed);
  setCountdown(remaining);
  if (remaining <= 0) {
    clearTimer(timerRef);
    setStatus((prev) => (prev === "active" ? "dismissing" : prev));
  }
}

function startTimer(
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  remainingRef: React.MutableRefObject<number>,
  startTimeRef: React.MutableRefObject<number>,
  setCountdown: React.Dispatch<React.SetStateAction<number>>,
  setStatus: React.Dispatch<React.SetStateAction<"idle" | "active" | "dismissing" | "dismissed">>,
) {
  remainingRef.current = 30;
  startTimeRef.current = Date.now();
  timerRef.current = setInterval(
    () => tick(timerRef, remainingRef, startTimeRef, setCountdown, setStatus),
    100,
  );
}

function handleSimulate(
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  remainingRef: React.MutableRefObject<number>,
  startTimeRef: React.MutableRefObject<number>,
  setCountdown: React.Dispatch<React.SetStateAction<number>>,
  setRetryCount: React.Dispatch<React.SetStateAction<number>>,
  setStatus: React.Dispatch<React.SetStateAction<"idle" | "active" | "dismissing" | "dismissed">>,
) {
  setStatus("active");
  setCountdown(30);
  setRetryCount(0);
  startTimer(timerRef, remainingRef, startTimeRef, setCountdown, setStatus);
}

function handleMouseEnter(
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  remainingRef: React.MutableRefObject<number>,
  startTimeRef: React.MutableRefObject<number>,
) {
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
  remainingRef.current = Math.max(0, remainingRef.current - elapsed);
}

function handleMouseLeave(
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  remainingRef: React.MutableRefObject<number>,
  startTimeRef: React.MutableRefObject<number>,
  setCountdown: React.Dispatch<React.SetStateAction<number>>,
  setStatus: React.Dispatch<React.SetStateAction<"idle" | "active" | "dismissing" | "dismissed">>,
) {
  if (timerRef.current === null && remainingRef.current > 0) {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(
      () => tick(timerRef, remainingRef, startTimeRef, setCountdown, setStatus),
      100,
    );
  }
}

function handleRetry(
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  remainingRef: React.MutableRefObject<number>,
  startTimeRef: React.MutableRefObject<number>,
  setCountdown: React.Dispatch<React.SetStateAction<number>>,
  setRetryCount: React.Dispatch<React.SetStateAction<number>>,
  setStatus: React.Dispatch<React.SetStateAction<"idle" | "active" | "dismissing" | "dismissed">>,
) {
  setStatus("active");
  setCountdown(30);
  setRetryCount((c) => c + 1);
  startTimer(timerRef, remainingRef, startTimeRef, setCountdown, setStatus);
}

export function ServerRetryTab() {
  const [status, setStatus] = useState<"idle" | "active" | "dismissing" | "dismissed">("idle");
  const [countdown, setCountdown] = useState(30);
  const [retryCount, setRetryCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(30);
  const startTimeRef = useRef(0);

  useEffect(() => {
    return () => clearTimer(timerRef);
  }, []);

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
          <Button
            onClick={() =>
              handleSimulate(timerRef, remainingRef, startTimeRef, setCountdown, setRetryCount, setStatus)
            }
            variant="destructive"
            className="w-fit"
          >
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
            onMouseEnter={() =>
              handleMouseEnter(timerRef, remainingRef, startTimeRef)
            }
            onMouseLeave={() =>
              handleMouseLeave(timerRef, remainingRef, startTimeRef, setCountdown, setStatus)
            }
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
                      onClick={() =>
                        handleRetry(timerRef, remainingRef, startTimeRef, setCountdown, setRetryCount, setStatus)
                      }
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
          <Button
            onClick={() =>
              handleRetry(timerRef, remainingRef, startTimeRef, setCountdown, setRetryCount, setStatus)
            }
            variant="destructive"
            className="w-fit"
          >
            Restart Health Check
          </Button>
        </div>
      )}
    </div>
  );
}
