import { useInfiniteQuery } from "@tanstack/react-query";
import { conversationMessagesQueryOptions } from "@/api/client/messages/query";

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  body: string | null;
  algVersion?: number | null;
  envelope?: Record<string, unknown> | null;
  createdAt: string;
  readAt: string | null;
  deliveredAt: string | null;
}

export function useConversation(peerId: string | null) {
  return useInfiniteQuery(conversationMessagesQueryOptions(peerId));
}
