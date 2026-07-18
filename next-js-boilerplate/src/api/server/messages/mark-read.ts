import { apiFetch } from "@/lib/api-client";
import { MESSAGES_READ_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function markMessagesReadServer(userId: string): Promise<void> {
  await apiFetch(MESSAGES_READ_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ userId }),
  });
}
