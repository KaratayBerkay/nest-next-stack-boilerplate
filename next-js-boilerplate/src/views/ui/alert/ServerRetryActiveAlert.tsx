import { Alert, AlertTitle } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { handleMouseEnter, handleMouseLeave, handleRetry } from "@/views/ui/alert/ServerRetryTimer";
import type { ServerRetryStatus } from "@/types/ui/ServerRetryTab-types";

interface ServerRetryActiveAlertProps {
  status: ServerRetryStatus;
  countdown: number;
  retryCount: number;
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  remainingRef: React.MutableRefObject<number>;
  startTimeRef: React.MutableRefObject<number>;
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
  setRetryCount: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<ServerRetryStatus>>;
}

export function ServerRetryActiveAlert({
  status,
  countdown,
  retryCount,
  timerRef,
  remainingRef,
  startTimeRef,
  setCountdown,
  setRetryCount,
  setStatus,
}: ServerRetryActiveAlertProps) {
  return (
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
          handleMouseLeave(
            timerRef,
            remainingRef,
            startTimeRef,
            setCountdown,
            setStatus,
          )
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
                <span className="text-error font-medium">
                  ERR_CONNECTION_REFUSED
                </span>
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
                <span className="text-sm font-medium tabular-nums">
                  Retrying in {countdown}s…
                </span>
              </div>
              {status === "dismissing" && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() =>
                    handleRetry(
                      timerRef,
                      remainingRef,
                      startTimeRef,
                      setCountdown,
                      setRetryCount,
                      setStatus,
                    )
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
  );
}
