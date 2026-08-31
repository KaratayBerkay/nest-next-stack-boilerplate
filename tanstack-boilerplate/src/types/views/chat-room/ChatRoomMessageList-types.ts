import type { ChatRoomMessage } from "@/types/chat-room/ChatRoomMessage-types";

export interface ChatRoomMessageListProps {
  messages: ChatRoomMessage[];
  userId: string;
  onlineUserIds: Set<string>;
  msgsLoading: boolean;
  msgsError: boolean;
  hasNextPage: boolean;
  onFetchNextPage: () => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  t: Record<string, string>;
}
