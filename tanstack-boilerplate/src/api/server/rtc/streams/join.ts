import { apiFetchJson } from "@/lib/api-client";
import { RTC_STREAMS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import type { LiveStreamJoinResult } from "./types";

export async function joinStreamServer(
  slug: string,
): Promise<LiveStreamJoinResult> {
  return apiFetchJson<LiveStreamJoinResult>(
    `${RTC_STREAMS_PREFIX}${slug}/join`,
    { method: POST },
  );
}
