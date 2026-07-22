import type { ServerRetryStatus } from "@/types/ui/ServerRetryTab-types";

type TimerRef = React.MutableRefObject<ReturnType<typeof setInterval> | null>;
type RemainingRef = React.MutableRefObject<number>;
type StartTimeRef = React.MutableRefObject<number>;
type SetCountdown = React.Dispatch<React.SetStateAction<number>>;
type SetStatus = React.Dispatch<React.SetStateAction<ServerRetryStatus>>;
type SetRetryCount = React.Dispatch<React.SetStateAction<number>>;

export function clearTimer(timerRef: TimerRef) {
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
}

function tick(
  timerRef: TimerRef,
  remainingRef: RemainingRef,
  startTimeRef: StartTimeRef,
  setCountdown: SetCountdown,
  setStatus: SetStatus,
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
  timerRef: TimerRef,
  remainingRef: RemainingRef,
  startTimeRef: StartTimeRef,
  setCountdown: SetCountdown,
  setStatus: SetStatus,
) {
  remainingRef.current = 30;
  startTimeRef.current = Date.now();
  timerRef.current = setInterval(
    () => tick(timerRef, remainingRef, startTimeRef, setCountdown, setStatus),
    100,
  );
}

export function handleSimulate(
  timerRef: TimerRef,
  remainingRef: RemainingRef,
  startTimeRef: StartTimeRef,
  setCountdown: SetCountdown,
  setRetryCount: SetRetryCount,
  setStatus: SetStatus,
) {
  setStatus("active");
  setCountdown(30);
  setRetryCount(0);
  startTimer(timerRef, remainingRef, startTimeRef, setCountdown, setStatus);
}

export function handleMouseEnter(
  timerRef: TimerRef,
  remainingRef: RemainingRef,
  startTimeRef: StartTimeRef,
) {
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
  remainingRef.current = Math.max(0, remainingRef.current - elapsed);
}

export function handleMouseLeave(
  timerRef: TimerRef,
  remainingRef: RemainingRef,
  startTimeRef: StartTimeRef,
  setCountdown: SetCountdown,
  setStatus: SetStatus,
) {
  if (timerRef.current === null && remainingRef.current > 0) {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(
      () => tick(timerRef, remainingRef, startTimeRef, setCountdown, setStatus),
      100,
    );
  }
}

export function handleRetry(
  timerRef: TimerRef,
  remainingRef: RemainingRef,
  startTimeRef: StartTimeRef,
  setCountdown: SetCountdown,
  setRetryCount: SetRetryCount,
  setStatus: SetStatus,
) {
  setStatus("active");
  setCountdown(30);
  setRetryCount((c) => c + 1);
  startTimer(timerRef, remainingRef, startTimeRef, setCountdown, setStatus);
}
