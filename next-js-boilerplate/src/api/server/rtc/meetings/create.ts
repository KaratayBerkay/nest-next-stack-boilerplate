import { apiFetchJson } from "@/lib/api-client";
import { RTC_MEETINGS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { MeetingView } from "./types";

export async function createMeetingServer(title: string): Promise<MeetingView> {
  return apiFetchJson<MeetingView>(RTC_MEETINGS_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ title }),
  });
}
