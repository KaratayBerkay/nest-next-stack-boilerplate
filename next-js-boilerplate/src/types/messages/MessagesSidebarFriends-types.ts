import type { UserInfo } from "./ChatView-types";

export interface MessagesSidebarFriendsProps {
  search: string;
  friends: UserInfo[];
  openConversation: (u: UserInfo) => void;
  onlineUsers: Set<string>;
}
