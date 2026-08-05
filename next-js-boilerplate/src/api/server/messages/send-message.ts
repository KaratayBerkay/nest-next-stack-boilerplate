import { apiFetch } from "@/lib/api-client";
import { MESSAGES_CONVERSATIONS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";

export async function sendMessageServer(
  recipientId: string,
  text: string,
  tempId?: string,
  attachments?: MessageAttachment[],
): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = { text };
  if (tempId) body._tempId = tempId;
  if (attachments && attachments.length > 0) body.attachments = attachments;
  const res = await apiFetch(
    `${MESSAGES_CONVERSATIONS_PREFIX}${recipientId}/messages`,
    {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify(body),
    },
  );
  return res.json();
}
