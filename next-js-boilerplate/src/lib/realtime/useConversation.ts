import { useInfiniteQuery } from "@tanstack/react-query";
import { conversationMessagesQueryOptions } from "@/api/client/messages/query";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  body: string | null;
  createdAt: string;
  readAt: string | null;
  deliveredAt: string | null;
  deletedAt: string | null;
  attachments?: MessageAttachment[];
}

export function useConversation(peerId: string | null) {
  return useInfiniteQuery(conversationMessagesQueryOptions(peerId));
}
