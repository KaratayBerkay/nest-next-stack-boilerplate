import { apiFetch } from "@/lib/api-client";
import { MESSAGES_CONVERSATION_MESSAGES_PREFIX } from "@/constants/api/urls";

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  deliveredAt: string | null;
}

export interface ConversationPage {
  messages: Message[];
  hasMore: boolean;
}

export async function fetchConversationMessagesServer(
  peerId: string,
  before?: string,
  take: number = 30,
): Promise<ConversationPage> {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  params.set("take", String(take));
  const res = await apiFetch(
    `${MESSAGES_CONVERSATION_MESSAGES_PREFIX}${peerId}/messages?${params.toString()}`,
  );
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}
