import { apiFetchJson } from "@/lib/api-client";
import { RTC_MEETINGS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function endMeetingServer(slug: string): Promise<void> {
  await apiFetchJson(`${RTC_MEETINGS_PREFIX}${slug}/end`, { method: POST });
}
