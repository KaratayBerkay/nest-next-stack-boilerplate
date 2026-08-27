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
  replyToId?: string,
): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = { text };
  if (tempId) body._tempId = tempId;
  if (attachments && attachments.length > 0) body.attachments = attachments;
  if (replyToId) body.replyToId = replyToId;
  const res = await apiFetch(
    `${MESSAGES_CONVERSATIONS_PREFIX}${recipientId}/messages`,
    {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify(body),
    },
  );
  // apiFetch never throws on a non-2xx response — unlike its siblings here
  // (fetchConversationMessagesServer etc.), this call site returned the
  // error body as if it were a sent Message, so the optimistic bubble it
  // replaces got marked "sent" (no error, no retry) for a message the
  // backend actually rejected (rate limit, blocked user, validation).
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}
