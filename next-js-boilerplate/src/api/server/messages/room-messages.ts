import { apiFetch } from "@/lib/api-client";
import { MESSAGES_ROOM_MESSAGES_PREFIX } from "@/constants/api/urls";

export interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  body: string;
  createdAt: string;
}

export async function fetchRoomMessagesServer(
  room: string,
): Promise<RoomMessage[]> {
  const res = await apiFetch(
    `${MESSAGES_ROOM_MESSAGES_PREFIX}${room}/messages`,
  );
  if (!res.ok) throw new Error("Failed to fetch room messages");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.messages ?? []);
}
