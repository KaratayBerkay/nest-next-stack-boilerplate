import { apiFetch } from "@/lib/api-client";
import { PUSH_SUBSCRIBE_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function subscribePushServer(
  subscription: Record<string, unknown>,
): Promise<void> {
  await apiFetch(PUSH_SUBSCRIBE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify(subscription),
  });
}
