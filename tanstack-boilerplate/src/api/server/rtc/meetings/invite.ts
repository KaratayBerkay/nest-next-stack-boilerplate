import { apiFetchJson } from "@/lib/api-client";
import { RTC_MEETINGS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function inviteToMeetingServer(
  slug: string,
  userId: string,
): Promise<void> {
  await apiFetchJson(`${RTC_MEETINGS_PREFIX}${slug}/invite`, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ userId }),
  });
}
