import { apiFetch } from "@/lib/api-client";
import { RTC_ACTIVE_CALL_URL } from "@/constants/api/urls";

/**
 * Same frame shapes rtc:invite/rtc:accepted push over WS — this is a
 * recovery read for a client that (re)connected and may have missed the
 * point-in-time push, not a distinct payload shape of its own.
 */
export interface ActiveCallSnapshot {
  type: "rtc:invite" | "rtc:accepted";
  callId: string;
  callerId?: string;
  callerName?: string;
  callerAvatarUrl?: string | null;
  hasVideo?: boolean;
  peerId?: string;
  peerName?: string;
  peerAvatarUrl?: string | null;
  token?: string;
  roomName?: string;
  maxDurationMinutes?: number;
}

export async function fetchActiveCallServer(): Promise<ActiveCallSnapshot | null> {
  const res = await apiFetch(RTC_ACTIVE_CALL_URL, undefined, {
    suppressGlobalLogout: true,
  });
  if (!res.ok) throw new Error("Failed to fetch active call");
  const body = (await res.json()) as { call: ActiveCallSnapshot | null };
  return body.call;
}
