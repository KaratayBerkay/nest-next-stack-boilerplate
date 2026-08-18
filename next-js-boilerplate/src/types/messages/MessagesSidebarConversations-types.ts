import type { UserInfo } from "./ChatView-types";

type Conversation = {
  user: UserInfo;
  lastMessage: string | Record<string, unknown>;
  lastTime: string;
  hasAttachments?: boolean;
  unread: number;
  favorite: boolean;
  /** Friend with no message history yet — synthesized client-side so they
   *  still show up under the "All" filter instead of only appearing once a
   *  real conversation exists. */
  noHistory?: boolean;
};

export interface MessagesSidebarConversationsProps {
  conversations: Conversation[];
  selectedUser: UserInfo | null;
  openConversation: (u: UserInfo) => void;
  onlineUsers: Set<string>;
  convsError: boolean;
  convsLoading: boolean;
  onToggleFavorite: (peerId: string, next: boolean) => void;
  emptyMessage?: string;
}
