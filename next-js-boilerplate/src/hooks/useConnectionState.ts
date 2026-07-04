"use client";

import { useRealtimeStatus } from "@/lib/realtime/RealtimeProvider";

export type ConnectionState = "online" | "connecting" | "unstable";

export function useConnectionState(): ConnectionState {
  const status = useRealtimeStatus();
  if (status === "open") return "online";
  if (status === "backoff" || status === "down") return "unstable";
  return "connecting";
}
