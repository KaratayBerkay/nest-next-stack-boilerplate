import { apiFetch } from "@/lib/api-client";
import { EVENTS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function logEventServer(events: Record<string, unknown>[]): Promise<void> {
  await apiFetch(EVENTS_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ events }),
  });
}
