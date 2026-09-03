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
  /** Quote a message in the composer (CROSS-024). Omit to hide the actions menu. */
  onReply?: (msg: ChatRoomMessage) => void;
  /** Delete for me / for everyone (CROSS-024). */
  onDelete?: (messageId: string, scope: "me" | "everyone") => void;
}
