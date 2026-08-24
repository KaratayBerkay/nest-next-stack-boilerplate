import { apiFetchJson } from "@/lib/api-client";
import { RTC_STREAMS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { LiveStreamJoinResult } from "./types";

export async function goLiveServer(
  title: string,
): Promise<LiveStreamJoinResult> {
  return apiFetchJson<LiveStreamJoinResult>(RTC_STREAMS_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ title }),
  });
}
