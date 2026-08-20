import { queryOptions } from "@tanstack/react-query";
import { infiniteQueryOptions } from "@tanstack/react-query";
import type { Conversation } from "@/api/server/messages/conversations";
import type { ConversationPage } from "@/api/server/messages/conversation-messages";
import type { ConversationAttachmentsPage } from "@/api/server/messages/conversation-attachments";
import type { RoomAttachmentsPage } from "@/api/server/messages/room-attachments";
import type { RoomMessagesPage } from "@/api/server/messages/room-messages";
import { startOfDay, endOfDay } from "@/lib/date-time";

/** Search text + date range for the "All uploads" gallery, shared by the DM
 * and room variants. `from`/`to` are plain calendar-day picks — converted to
 * inclusive ISO day boundaries here, once, rather than in every caller. */
export interface AttachmentDateFilters {
  search?: string;
  from?: Date;
  to?: Date;
}

interface ResolvedAttachmentFilters {
  search?: string;
  from?: string;
  to?: string;
}

function resolveAttachmentFilters(
  filters?: AttachmentDateFilters,
): ResolvedAttachmentFilters | undefined {
  if (!filters) return undefined;
  const search = filters.search?.trim() || undefined;
  const from = filters.from
    ? startOfDay(filters.from).toISOString()
    : undefined;
  const to = filters.to ? endOfDay(filters.to).toISOString() : undefined;
  if (!search && !from && !to) return undefined;
  return { search, from, to };
}

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

async function fetchRoomMessages(
  room: string,
  before?: string,
): Promise<RoomMessagesPage> {
  const { fetchRoomMessagesServer } =
    await import("@/api/server/messages/room-messages");
  return fetchRoomMessagesServer(room, before);
}

async function fetchConversationAttachments(
  peerId: string,
  before?: string,
  filters?: ResolvedAttachmentFilters,
): Promise<ConversationAttachmentsPage> {
  const { fetchConversationAttachmentsServer } =
    await import("@/api/server/messages/conversation-attachments");
  return fetchConversationAttachmentsServer(peerId, before, 30, filters);
}

async function fetchRoomAttachments(
  room: string,
  before?: string,
  filters?: ResolvedAttachmentFilters,
): Promise<RoomAttachmentsPage> {
  const { fetchRoomAttachmentsServer } =
    await import("@/api/server/messages/room-attachments");
  return fetchRoomAttachmentsServer(room, before, 30, filters);
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
 *
 * `filters` is folded into the query key, so changing the search text or
 * date range naturally starts a fresh paginated query from page 1.
 */
export function conversationAttachmentsQueryOptions(
  peerId: string | null,
  filters?: AttachmentDateFilters,
) {
  const resolvedFilters = resolveAttachmentFilters(filters);
  return infiniteQueryOptions<ConversationAttachmentsPage>({
    queryKey: ["conversation-attachments", peerId, resolvedFilters ?? null],
    queryFn: async ({ pageParam }) => {
      return fetchConversationAttachments(
        peerId!,
        pageParam as string | undefined,
        resolvedFilters,
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
  return infiniteQueryOptions<RoomMessagesPage>({
    queryKey: ["room", room],
    queryFn: async ({ pageParam }) => {
      return fetchRoomMessages(room!, pageParam as string | undefined);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.messages[0]?.createdAt : undefined,
    enabled: !!room,
    staleTime: 30_000,
  });
}

/**
 * Every file ever shared in a room, newest first. Mirrors
 * `conversationAttachmentsQueryOptions`: pages are already newest-first from
 * the backend and are flattened in fetch order (flat gallery, not a
 * bottom-anchored chat scroll), so the next cursor is the *last* item of the
 * current page. `filters` is folded into the query key — see
 * `conversationAttachmentsQueryOptions` for why.
 */
export function roomAttachmentsQueryOptions(
  room: string | null,
  filters?: AttachmentDateFilters,
) {
  const resolvedFilters = resolveAttachmentFilters(filters);
  return infiniteQueryOptions<RoomAttachmentsPage>({
    queryKey: ["room-attachments", room, resolvedFilters ?? null],
    queryFn: async ({ pageParam }) => {
      return fetchRoomAttachments(
        room!,
        pageParam as string | undefined,
        resolvedFilters,
      );
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
