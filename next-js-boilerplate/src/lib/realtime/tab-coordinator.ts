import type { RealtimeStatus } from "./realtime-client";

const CHANNEL = "rt-coord";

export type Cmd =
  | { type: "frame"; data: Record<string, unknown> }
  | { type: "st"; status: RealtimeStatus }
  | { type: "cmd"; act: string; payload: unknown };

export type ClaimPayload = {
  page: string | null;
  params?: Record<string, string>;
  tabId: string;
};

export function openBc(): BroadcastChannel | null {
  try {
    return new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
}
