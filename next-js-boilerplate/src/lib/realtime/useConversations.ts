import { useQuery } from "@tanstack/react-query";
import { conversationsQueryOptions } from "@/api/client/messages/query";

export interface Conversation {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    online: boolean;
  };
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export function useConversations() {
  return useQuery(conversationsQueryOptions());
}
