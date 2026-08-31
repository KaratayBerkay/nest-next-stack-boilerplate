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

export interface ConversationAttachmentsFilters {
  search?: string;
  from?: string;
  to?: string;
}

export async function fetchConversationAttachmentsServer(
  peerId: string,
  before?: string,
  take: number = 30,
  filters?: ConversationAttachmentsFilters,
): Promise<ConversationAttachmentsPage> {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  params.set("take", String(take));
  if (filters?.search) params.set("search", filters.search);
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  const res = await apiFetch(
    `${MESSAGES_CONVERSATION_ATTACHMENTS_PREFIX}${peerId}/attachments?${params.toString()}`,
  );
  if (!res.ok) throw new Error("Failed to fetch attachments");
  return res.json();
}
