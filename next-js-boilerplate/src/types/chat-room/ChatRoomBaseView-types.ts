import type { ChatRoomViewProps } from "@/types/chat-room/ChatRoomView-types";

export interface ChatRoomBaseViewProps extends ChatRoomViewProps {
  showPageInfo?: boolean;
  vipRooms?: string[];
  useNativeControls?: boolean;
  showSelfCrown?: boolean;
  className?: string;
}
