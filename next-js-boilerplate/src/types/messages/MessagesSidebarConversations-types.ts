import type { UserInfo } from "./ChatView-types";

type Conversation = {
  user: UserInfo;
  lastMessage: string;
  lastTime: string;
  unread: number;
};

export interface MessagesSidebarConversationsProps {
  conversations: Conversation[];
  selectedUser: UserInfo | null;
  openConversation: (u: UserInfo) => void;
  onlineUsers: Set<string>;
  convsError: boolean;
}
