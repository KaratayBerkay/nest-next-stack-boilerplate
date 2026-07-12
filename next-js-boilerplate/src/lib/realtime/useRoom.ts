import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { MESSAGES_ROOM_MESSAGES_PREFIX } from "@/constants/api/urls";

interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  body: string;
  createdAt: string;
}

export function useRoom(room: string | null) {
  return useQuery<RoomMessage[]>({
    queryKey: ["room", room],
    queryFn: async () => {
      if (!room) return [];
      const res = await apiFetch(
        `${MESSAGES_ROOM_MESSAGES_PREFIX}${room}/messages`,
      );
      if (!res.ok) throw new Error("Failed to fetch room messages");
      const data = await res.json();
      return Array.isArray(data) ? data : (data.messages ?? []);
    },
    enabled: !!room,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}
