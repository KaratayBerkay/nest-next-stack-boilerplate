import { apiFetch, apiFetchJson } from "@/lib/api-client";
import { RTC_MEETINGS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { RtcRecordingView } from "@/api/server/rtc/shared-types";

export async function getMeetingRecordingServer(
  slug: string,
): Promise<RtcRecordingView | null> {
  const res = await apiFetch(`${RTC_MEETINGS_PREFIX}${slug}/recording`);
  if (!res.ok) return null;
  return res.json();
}

export async function startMeetingRecordingServer(
  slug: string,
): Promise<RtcRecordingView> {
  return apiFetchJson<RtcRecordingView>(
    `${RTC_MEETINGS_PREFIX}${slug}/recording`,
    {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ action: "start" }),
    },
  );
}

export async function stopMeetingRecordingServer(
  slug: string,
): Promise<RtcRecordingView> {
  return apiFetchJson<RtcRecordingView>(
    `${RTC_MEETINGS_PREFIX}${slug}/recording`,
    {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ action: "stop" }),
    },
  );
}
