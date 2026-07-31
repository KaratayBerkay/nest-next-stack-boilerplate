import { apiFetch } from "@/lib/api-client";
import { MESSAGES_ROOM_MESSAGES_PREFIX } from "@/constants/api/urls";

export type { ChatRoomMessage } from "@/types/chat-room/ChatRoomMessage-types";
import type { ChatRoomMessage } from "@/types/chat-room/ChatRoomMessage-types";

export async function fetchRoomMessagesServer(
  room: string,
): Promise<ChatRoomMessage[]> {
  const res = await apiFetch(
    `${MESSAGES_ROOM_MESSAGES_PREFIX}${room}/messages`,
  );
  if (!res.ok) throw new Error("Failed to fetch room messages");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.messages ?? []);
}
