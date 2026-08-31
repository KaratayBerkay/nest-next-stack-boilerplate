import { apiFetchJson } from "@/lib/api-client";
import { RTC_MEETINGS_URL } from "@/constants/api/urls";
import type { MeetingView } from "./types";

export async function listMeetingsServer(): Promise<MeetingView[]> {
  const data = await apiFetchJson<{ meetings: MeetingView[] }>(
    RTC_MEETINGS_URL,
  );
  return data.meetings;
}
