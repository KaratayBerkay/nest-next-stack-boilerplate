import type { Message } from "./ChatView-types";
import type { DateDisplayFormat } from "@/constants/date-display";

export interface ChatMessageBubbleProps {
  msg: Message;
  isMe: boolean;
  userName: string;
  userEmail: string;
  dateDisplay: DateDisplayFormat;
}
