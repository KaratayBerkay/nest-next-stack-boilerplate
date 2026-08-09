import type { Message } from "./ChatView-types";
import type { DateDisplayFormat } from "@/constants/date-display";

export interface ChatMessageBubbleProps {
  msg: Message;
  isMe: boolean;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string | null;
  dateDisplay: DateDisplayFormat;
  onDelete: (messageId: string, scope: "me" | "everyone") => void;
  onReply: (msg: Message) => void;
}
