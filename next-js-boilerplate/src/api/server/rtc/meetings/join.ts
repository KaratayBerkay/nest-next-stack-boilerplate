import { apiFetchJson } from "@/lib/api-client";
import { RTC_MEETINGS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import type { JoinMeetingResult } from "./types";

export async function joinMeetingServer(
  slug: string,
): Promise<JoinMeetingResult> {
  return apiFetchJson<JoinMeetingResult>(`${RTC_MEETINGS_PREFIX}${slug}/join`, {
    method: POST,
  });
}
