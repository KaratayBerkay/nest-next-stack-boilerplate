import { apiFetch } from "@/lib/api-client";
import { RTC_CALLS_URL } from "@/constants/api/urls";

export interface CallHistoryPeer {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CallHistoryEntry {
  id: string;
  peer: CallHistoryPeer;
  direction: "incoming" | "outgoing";
  hasVideo: boolean;
  state: string;
  ringingAt: string;
  acceptedAt: string | null;
  endedAt: string | null;
  endReason: string | null;
}

export interface CallHistoryPage {
  calls: CallHistoryEntry[];
  hasMore: boolean;
}

export async function fetchCallHistoryServer(
  before?: string,
  take: number = 30,
): Promise<CallHistoryPage> {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  params.set("take", String(take));
  const res = await apiFetch(`${RTC_CALLS_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch call history");
  return res.json();
}
