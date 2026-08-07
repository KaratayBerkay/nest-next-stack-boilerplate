import { queryOptions } from "@tanstack/react-query";
import { infiniteQueryOptions } from "@tanstack/react-query";
import type { Conversation } from "@/api/server/messages/conversations";
import type { ConversationPage } from "@/api/server/messages/conversation-messages";
import type { ConversationAttachmentsPage } from "@/api/server/messages/conversation-attachments";
import type { RoomAttachmentsPage } from "@/api/server/messages/room-attachments";
import type { ChatRoomMessage } from "@/types/chat-room/ChatRoomMessage-types";

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

async function fetchRoomMessages(room: string): Promise<ChatRoomMessage[]> {
  const { fetchRoomMessagesServer } =
    await import("@/api/server/messages/room-messages");
  return fetchRoomMessagesServer(room);
}

async function fetchConversationAttachments(
  peerId: string,
  before?: string,
): Promise<ConversationAttachmentsPage> {
  const { fetchConversationAttachmentsServer } =
    await import("@/api/server/messages/conversation-attachments");
  return fetchConversationAttachmentsServer(peerId, before);
}

async function fetchRoomAttachments(
  room: string,
  before?: string,
): Promise<RoomAttachmentsPage> {
  const { fetchRoomAttachmentsServer } =
    await import("@/api/server/messages/room-attachments");
  return fetchRoomAttachmentsServer(room, before);
}

// Module-level own user ID cache (set by the query hooks)
let _ownUserId: string | null = null;

export function setOwnUserId(id: string | null): void {
  _ownUserId = id;
}

export async function getOwnUserId(): Promise<string | null> {
  return _ownUserId;
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

/**
 * Every file exchanged in a conversation, newest first. Unlike
 * `conversationMessagesQueryOptions`, pages are NOT reversed — the backend
 * already returns each page newest-first, and this feeds a flat top-to-
 * bottom gallery (not a bottom-anchored chat scroll), so pages should be
 * flattened in fetch order. The next cursor is therefore the *last* item of
 * the current page (the oldest one loaded so far), not the first.
 */
export function conversationAttachmentsQueryOptions(peerId: string | null) {
  return infiniteQueryOptions<ConversationAttachmentsPage>({
    queryKey: ["conversation-attachments", peerId],
    queryFn: async ({ pageParam }) => {
      return fetchConversationAttachments(
        peerId!,
        pageParam as string | undefined,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.attachments[lastPage.attachments.length - 1]?.createdAt
        : undefined,
    enabled: !!peerId,
    staleTime: 30_000,
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

/**
 * Every file ever shared in a room, newest first. Mirrors
 * `conversationAttachmentsQueryOptions`: pages are already newest-first from
 * the backend and are flattened in fetch order (flat gallery, not a
 * bottom-anchored chat scroll), so the next cursor is the *last* item of the
 * current page.
 */
export function roomAttachmentsQueryOptions(room: string | null) {
  return infiniteQueryOptions<RoomAttachmentsPage>({
    queryKey: ["room-attachments", room],
    queryFn: async ({ pageParam }) => {
      return fetchRoomAttachments(room!, pageParam as string | undefined);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.attachments[lastPage.attachments.length - 1]?.createdAt
        : undefined,
    enabled: !!room,
    staleTime: 30_000,
  });
}
