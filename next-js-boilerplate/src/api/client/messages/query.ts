import { queryOptions } from "@tanstack/react-query";
import { infiniteQueryOptions } from "@tanstack/react-query";
import type { Conversation } from "@/api/server/messages/conversations";
import type { ConversationPage } from "@/api/server/messages/conversation-messages";
import type { RoomMessage } from "@/api/server/messages/room-messages";

async function fetchConversations(): Promise<Conversation[]> {
  const { fetchConversationsServer } =
    await import("@/api/server/messages/conversations");
  return fetchConversationsServer();
}

async function fetchConversationMessages(
  peerId: string,
  before?: string,
): Promise<ConversationPage> {
  const { fetchConversationMessagesServer } =
    await import("@/api/server/messages/conversation-messages");
  return fetchConversationMessagesServer(peerId, before);
}

async function fetchRoomMessages(room: string): Promise<RoomMessage[]> {
  const { fetchRoomMessagesServer } =
    await import("@/api/server/messages/room-messages");
  return fetchRoomMessagesServer(room);
}

export function conversationsQueryOptions() {
  return queryOptions({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 30_000,
  });
}

export function conversationMessagesQueryOptions(peerId: string | null) {
  return infiniteQueryOptions<ConversationPage>({
    queryKey: ["messages", peerId],
    queryFn: async ({ pageParam }) => {
      return fetchConversationMessages(
        peerId!,
        pageParam as string | undefined,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.messages[0]?.createdAt : undefined,
    enabled: !!peerId,
    staleTime: Infinity,
  });
}

export function roomMessagesQueryOptions(room: string | null) {
  return queryOptions({
    queryKey: ["room", room],
    queryFn: async () => {
      if (!room) return [];
      return fetchRoomMessages(room);
    },
    enabled: !!room,
    staleTime: 30_000,
  });
}
