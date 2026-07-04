import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  deliveredAt: string | null;
}

interface ConversationPage {
  messages: Message[];
  hasMore: boolean;
}

export function useConversation(peerId: string | null) {
  return useInfiniteQuery<ConversationPage>({
    queryKey: ["messages", peerId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("before", pageParam as string);
      params.set("take", "30");
      const res = await apiFetch(
        `/api/messages/conversations/${peerId}/messages?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.messages[0]?.createdAt
        : undefined,
    enabled: !!peerId,
    staleTime: Infinity,
  });
}
