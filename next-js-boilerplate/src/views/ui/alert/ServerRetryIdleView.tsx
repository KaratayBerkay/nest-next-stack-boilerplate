import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { handleSimulate } from "@/views/ui/alert/ServerRetryTimer";
import type { ServerRetryStatus } from "@/types/ui/ServerRetryTab-types";

interface ServerRetryIdleViewProps {
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  remainingRef: React.MutableRefObject<number>;
  startTimeRef: React.MutableRefObject<number>;
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
  setRetryCount: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<ServerRetryStatus>>;
}

export function ServerRetryIdleView({
  timerRef,
  remainingRef,
  startTimeRef,
  setCountdown,
  setRetryCount,
  setStatus,
}: ServerRetryIdleViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-border rounded-lg border p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="bg-success size-2 rounded-full" />
          <span className="text-sm font-medium">api.example.com</span>
          <Badge variant="success" size="sm">
            Healthy
          </Badge>
        </div>
        <div className="text-muted grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="mb-0.5 font-medium tracking-wider uppercase opacity-60">
              Latency
            </div>
            <div>42ms</div>
          </div>
          <div>
            <div className="mb-0.5 font-medium tracking-wider uppercase opacity-60">
              Uptime
            </div>
            <div>99.98%</div>
          </div>
          <div>
            <div className="mb-0.5 font-medium tracking-wider uppercase opacity-60">
              Last Check
            </div>
            <div>Just now</div>
          </div>
        </div>
      </div>
      <p className="text-muted text-sm">
        Simulate a server outage to see the auto-retry behavior with countdown
        and exponential backoff.
      </p>
      <Button
        onClick={() =>
          handleSimulate(
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
        Simulate Server Outage
      </Button>
    </div>
  );
}
