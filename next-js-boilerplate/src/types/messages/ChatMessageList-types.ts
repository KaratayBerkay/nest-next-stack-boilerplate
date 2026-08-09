import type { RefObject } from "react";
import type { Message, UserInfo } from "@/types/messages/ChatView-types";
import type { DateDisplayFormat } from "@/constants/date-display";

export interface ChatMessageListProps {
  messagesRef: (el: HTMLDivElement | null) => void;
  msgsError: boolean;
  hasNextPage: boolean;
  onFetchNextPage: () => void;
  groupedMessages: { date: string; messages: Message[] }[];
  conversationMessages: Message[];
  user: UserInfo;
  selectedUser: UserInfo;
  dateDisplay: DateDisplayFormat;
  bottomRef: RefObject<HTMLDivElement | null>;
  onDelete: (messageId: string, scope: "me" | "everyone") => void;
  onReply: (msg: Message) => void;
  t: {
    failedToLoad: string;
    noMessages: string;
    decryptionFailed: string;
  };
}
