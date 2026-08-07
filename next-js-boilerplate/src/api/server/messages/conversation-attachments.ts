import { apiFetch } from "@/lib/api-client";
import { MESSAGES_CONVERSATION_ATTACHMENTS_PREFIX } from "@/constants/api/urls";

export interface ConversationAttachment {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  type: string;
  name: string;
  size: number;
  createdAt: string;
  messageId: string;
}

export interface ConversationAttachmentsPage {
  attachments: ConversationAttachment[];
  hasMore: boolean;
}

export async function fetchConversationAttachmentsServer(
  peerId: string,
  before?: string,
  take: number = 30,
): Promise<ConversationAttachmentsPage> {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  params.set("take", String(take));
  const res = await apiFetch(
    `${MESSAGES_CONVERSATION_ATTACHMENTS_PREFIX}${peerId}/attachments?${params.toString()}`,
  );
  if (!res.ok) throw new Error("Failed to fetch attachments");
  return res.json();
}
