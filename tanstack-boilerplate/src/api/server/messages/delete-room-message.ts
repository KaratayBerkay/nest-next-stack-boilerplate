import { apiFetch } from "@/lib/api-client";
import { MESSAGES_ROOM_MESSAGES_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

// Room-message counterparts of delete-message.ts (CROSS-024). Same contract:
// apiFetch never throws on a non-2xx, so throw here to let the caller's
// optimistic patch roll back.
export async function deleteRoomMessageForMeServer(
  room: string,
  messageId: string,
): Promise<void> {
  const res = await apiFetch(
    `${MESSAGES_ROOM_MESSAGES_PREFIX}${room}/messages/${messageId}/delete-for-me`,
    { method: POST },
  );
  if (!res.ok) throw new Error("Failed to delete room message");
}

export async function deleteRoomMessageForEveryoneServer(
  room: string,
  messageId: string,
): Promise<void> {
  const res = await apiFetch(
    `${MESSAGES_ROOM_MESSAGES_PREFIX}${room}/messages/${messageId}/delete-for-everyone`,
    { method: POST },
  );
  if (!res.ok) throw new Error("Failed to delete room message");
}
