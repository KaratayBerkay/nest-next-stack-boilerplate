import { apiFetch } from "@/lib/api-client";
import { MESSAGES_CONVERSATIONS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";

export async function sendMessageServer(
  recipientId: string,
  text: string,
  tempId?: string,
  attachment?: MessageAttachment,
  envelope?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = { text };
  if (tempId) body._tempId = tempId;
  if (attachment) {
    body.attachmentUrl = attachment.url;
    body.attachmentType = attachment.type;
    body.attachmentName = attachment.name;
    if (attachment.storageEnvelope) {
      body.attachmentEnvelope = attachment.storageEnvelope;
    }
  }
  if (envelope) {
    body.envelope = envelope;
  }
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
