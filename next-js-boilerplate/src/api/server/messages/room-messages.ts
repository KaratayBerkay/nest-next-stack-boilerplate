import { apiFetch } from "@/lib/api-client";
import { MESSAGES_ROOM_MESSAGES_PREFIX } from "@/constants/api/urls";

export type { ChatRoomMessage } from "@/types/chat-room/ChatRoomMessage-types";
import type { ChatRoomMessage } from "@/types/chat-room/ChatRoomMessage-types";

export interface RoomMessagesPage {
  messages: ChatRoomMessage[];
  hasMore: boolean;
}

export async function fetchRoomMessagesServer(
  room: string,
  before?: string,
  take: number = 30,
): Promise<RoomMessagesPage> {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  params.set("take", String(take));
  const res = await apiFetch(
    `${MESSAGES_ROOM_MESSAGES_PREFIX}${room}/messages?${params.toString()}`,
  );
  if (!res.ok) throw new Error("Failed to fetch room messages");
  const data = await res.json();
  const messages = Array.isArray(data) ? data : (data.messages ?? []);
  return { messages, hasMore: Array.isArray(data) ? false : !!data.hasMore };
}
