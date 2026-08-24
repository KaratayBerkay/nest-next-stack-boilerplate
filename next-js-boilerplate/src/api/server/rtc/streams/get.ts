import { apiFetchJson } from "@/lib/api-client";
import { RTC_STREAMS_PREFIX } from "@/constants/api/urls";
import type { LiveStreamView } from "./types";

export async function getStreamServer(slug: string): Promise<LiveStreamView> {
  return apiFetchJson<LiveStreamView>(RTC_STREAMS_PREFIX + slug);
}
