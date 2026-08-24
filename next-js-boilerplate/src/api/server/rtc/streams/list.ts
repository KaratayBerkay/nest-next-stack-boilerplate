import { apiFetchJson } from "@/lib/api-client";
import { RTC_STREAMS_URL } from "@/constants/api/urls";
import type { LiveStreamView } from "./types";

export async function listLiveStreamsServer(): Promise<LiveStreamView[]> {
  const data = await apiFetchJson<{ streams: LiveStreamView[] }>(
    RTC_STREAMS_URL,
  );
  return data.streams;
}
