import type { Room } from "@/api/server/messages/rooms";

export interface MessagesSidebarRoomsProps {
  rooms: Room[];
  roomsLoading: boolean;
  lang: string;
}
