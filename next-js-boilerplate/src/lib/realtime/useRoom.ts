import { useQuery } from "@tanstack/react-query";
import { roomMessagesQueryOptions } from "@/api/client/messages/query";

export interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  body: string;
  createdAt: string;
}

export function useRoom(room: string | null) {
  return useQuery(roomMessagesQueryOptions(room));
}
