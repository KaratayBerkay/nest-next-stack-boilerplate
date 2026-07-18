import { apiFetch } from "@/lib/api-client";
import { MESSAGES_CONVERSATIONS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function sendMessageServer(recipientId: string, text: string): Promise<void> {
  await apiFetch(`${MESSAGES_CONVERSATIONS_PREFIX}${recipientId}/messages`, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ text }),
  });
}
