import type { Dispatch, SetStateAction } from "react";
import type { SidebarFilter } from "./MessagesSidebarFilterBar-types";

type UserInfo = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export interface MessagesSidebarProps {
  conversations: Array<{
    user: UserInfo;
    lastMessage: string | Record<string, unknown>;
    lastTime: string;
    unread: number;
    favorite: boolean;
  }>;
  selectedUser: UserInfo | null;
  friends: UserInfo[];
  filter: SidebarFilter;
  setFilter: Dispatch<SetStateAction<SidebarFilter>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;

  openConversation: (u: UserInfo) => void;
  onToggleFavorite: (peerId: string, next: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  onlineUsers: Set<string>;
  convsError: boolean;
  convsLoading: boolean;
}
