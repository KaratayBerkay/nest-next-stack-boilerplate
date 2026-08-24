import { apiFetchJson } from "@/lib/api-client";
import { RTC_MEETINGS_PREFIX } from "@/constants/api/urls";
import type { MeetingView } from "./types";

export async function getMeetingServer(slug: string): Promise<MeetingView> {
  return apiFetchJson<MeetingView>(RTC_MEETINGS_PREFIX + slug);
}
