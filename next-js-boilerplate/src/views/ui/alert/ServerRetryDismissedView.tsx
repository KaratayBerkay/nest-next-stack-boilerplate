import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { handleRetry } from "@/views/ui/alert/ServerRetryTimer";
import type { ServerRetryStatus } from "@/types/ui/ServerRetryTab-types";

interface ServerRetryDismissedViewProps {
  retryCount: number;
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  remainingRef: React.MutableRefObject<number>;
  startTimeRef: React.MutableRefObject<number>;
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
  setRetryCount: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<ServerRetryStatus>>;
}

export function ServerRetryDismissedView({
  retryCount,
  timerRef,
  remainingRef,
  startTimeRef,
  setCountdown,
  setRetryCount,
  setStatus,
}: ServerRetryDismissedViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-border rounded-lg border p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="bg-error size-2 rounded-full" />
          <span className="text-sm font-medium">api.example.com</span>
          <Badge variant="error" size="sm">
            Down
          </Badge>
        </div>
        <div className="text-muted grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="mb-0.5 font-medium tracking-wider uppercase opacity-60">
              Attempts
            </div>
            <div>{retryCount + 1} failed</div>
          </div>
          <div>
            <div className="mb-0.5 font-medium tracking-wider uppercase opacity-60">
              Last Error
            </div>
            <div>Connection refused</div>
          </div>
          <div>
            <div className="mb-0.5 font-medium tracking-wider uppercase opacity-60">
              Status
            </div>
            <div className="text-error">Exhausted</div>
          </div>
        </div>
      </div>
      <p className="text-muted text-sm">
        All retry attempts failed. The server is currently unreachable.
      </p>
      <Button
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
        variant="destructive"
        className="w-fit"
      >
        Restart Health Check
      </Button>
    </div>
  );
}
