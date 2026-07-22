"use client";

import { useState, useRef, useEffect } from "react";
import type { ServerRetryStatus } from "@/types/ui/ServerRetryTab-types";
import { clearTimer } from "@/views/ui/alert/ServerRetryTimer";
import { ServerRetryIdleView } from "@/views/ui/alert/ServerRetryIdleView";
import { ServerRetryActiveAlert } from "@/views/ui/alert/ServerRetryActiveAlert";
import { ServerRetryDismissedView } from "@/views/ui/alert/ServerRetryDismissedView";

export function ServerRetryTab() {
  const [status, setStatus] = useState<ServerRetryStatus>("idle");
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
        <ServerRetryIdleView
          timerRef={timerRef}
          remainingRef={remainingRef}
          startTimeRef={startTimeRef}
          setCountdown={setCountdown}
          setRetryCount={setRetryCount}
          setStatus={setStatus}
        />
      )}

      {(status === "active" || status === "dismissing") && (
        <ServerRetryActiveAlert
          status={status}
          countdown={countdown}
          retryCount={retryCount}
          timerRef={timerRef}
          remainingRef={remainingRef}
          startTimeRef={startTimeRef}
          setCountdown={setCountdown}
          setRetryCount={setRetryCount}
          setStatus={setStatus}
        />
      )}

      {status === "dismissed" && (
        <ServerRetryDismissedView
          retryCount={retryCount}
          timerRef={timerRef}
          remainingRef={remainingRef}
          startTimeRef={startTimeRef}
          setCountdown={setCountdown}
          setRetryCount={setRetryCount}
          setStatus={setStatus}
        />
      )}
    </div>
  );
}
