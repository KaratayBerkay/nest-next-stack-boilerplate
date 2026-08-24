import { apiFetchJson } from "@/lib/api-client";
import { RTC_MEETINGS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function muteParticipantServer(
  slug: string,
  userId: string,
  muted: boolean,
): Promise<void> {
  await apiFetchJson(`${RTC_MEETINGS_PREFIX}${slug}/participants`, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ action: "mute", userId, muted }),
  });
}

export async function removeParticipantServer(
  slug: string,
  userId: string,
): Promise<void> {
  await apiFetchJson(`${RTC_MEETINGS_PREFIX}${slug}/participants`, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ action: "remove", userId }),
  });
}
