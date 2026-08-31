import type { Conversation } from "@/lib/realtime/useConversations";

export interface MessageDropdownProps {
  conversations: Conversation[];
  lang: string;
}
