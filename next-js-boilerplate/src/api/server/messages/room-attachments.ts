import { apiFetch } from "@/lib/api-client";
import { MESSAGES_ROOM_ATTACHMENTS_PREFIX } from "@/constants/api/urls";

export interface RoomAttachment {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  type: string;
  name: string;
  size: number;
  createdAt: string;
  roomMessageId: string;
}

export interface RoomAttachmentsPage {
  attachments: RoomAttachment[];
  hasMore: boolean;
}

export async function fetchRoomAttachmentsServer(
  room: string,
  before?: string,
  take: number = 30,
): Promise<RoomAttachmentsPage> {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  params.set("take", String(take));
  const res = await apiFetch(
    `${MESSAGES_ROOM_ATTACHMENTS_PREFIX}${room}/attachments?${params.toString()}`,
  );
  if (!res.ok) throw new Error("Failed to fetch room attachments");
  return res.json();
}
