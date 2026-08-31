import { apiFetchJson } from "@/lib/api-client";
import { RTC_MEETINGS_PREFIX } from "@/constants/api/urls";
import type { MeetingChatMessagesPage } from "./types";

export async function getMeetingChatServer(
  slug: string,
  before?: string,
  take?: number,
): Promise<MeetingChatMessagesPage> {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  if (take) params.set("take", String(take));
  const qs = params.toString();
  return apiFetchJson<MeetingChatMessagesPage>(
    `${RTC_MEETINGS_PREFIX}${slug}/chat${qs ? `?${qs}` : ""}`,
  );
}
