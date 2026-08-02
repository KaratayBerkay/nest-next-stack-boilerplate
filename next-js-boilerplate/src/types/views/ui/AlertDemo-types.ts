import type { ServerRetryStatus } from "@/types/ui/ServerRetryTab-types";

export interface ServerRetryIdleViewProps {
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  remainingRef: React.MutableRefObject<number>;
  startTimeRef: React.MutableRefObject<number>;
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
  setRetryCount: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<ServerRetryStatus>>;
}

export interface ServerRetryDismissedViewProps {
  retryCount: number;
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  remainingRef: React.MutableRefObject<number>;
  startTimeRef: React.MutableRefObject<number>;
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
  setRetryCount: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<ServerRetryStatus>>;
}

export interface CountdownRingProps {
  remainingMs: number;
  totalSeconds: number;
}

export type AlertVariant = "default" | "info" | "success" | "warning" | "error";

export interface DismissibleAlertSectionProps {
  alertVariant: AlertVariant;
  onVariantChange: (v: AlertVariant) => void;
  dismissed: boolean;
  onDismiss: () => void;
  onReset: () => void;
}

export interface ServerRetryActiveAlertProps {
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
