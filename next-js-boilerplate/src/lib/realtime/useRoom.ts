import { useInfiniteQuery } from "@tanstack/react-query";
import { roomMessagesQueryOptions } from "@/api/client/messages/query";
import type { ChatRoomMessage } from "@/types/chat-room/ChatRoomMessage-types";

export type { ChatRoomMessage };

export function useRoom(room: string | null) {
  return useInfiniteQuery(roomMessagesQueryOptions(room));
}
