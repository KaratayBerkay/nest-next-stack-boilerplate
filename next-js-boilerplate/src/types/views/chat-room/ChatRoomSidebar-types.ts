export interface ChatRoomSidebarProps {
  useNativeControls: boolean;
  sidebarOpen: boolean;
  rooms: string[];
  room: string;
  roomCounts: Record<string, number>;
  vipRooms: string[];
  roomMembers: {
    id: string;
    name: string;
    chatNickname?: string;
    avatarUrl?: string | null;
  }[];
  user: { id: string; name?: string | null };
  showSelfCrown: boolean;
  t: Record<string, string>;
  onSetSidebarOpen: (open: boolean) => void;
  onSelectRoom: (r: string) => void;
}
