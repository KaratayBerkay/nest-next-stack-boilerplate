import type { Dispatch, SetStateAction } from "react";

type UserInfo = { id: string; name: string; email: string; avatarUrl: string | null };

export interface MessagesSidebarProps {
  user: UserInfo;
  conversations: Array<{ user: UserInfo; lastMessage: string; unread: number }>;
  friends: UserInfo[];
  selectedUser: UserInfo | null;
  tab: "conversations" | "friends";
  setTab: Dispatch<SetStateAction<"conversations" | "friends">>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  findInput: string;
  setFindInput: Dispatch<SetStateAction<string>>;
  findResults: UserInfo[];
  sentRequestIds: Set<string>;
  setSentRequestIds: Dispatch<SetStateAction<Set<string>>>;
  setFindResults: Dispatch<SetStateAction<UserInfo[]>>;
  openConversation: (u: UserInfo) => void;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  debouncedSearch: (val: string) => void;
  onlineUsers: Set<string>;
  convsError: boolean;
  progress: number;
  direction: "left" | "right";
  isSwiping: boolean;
}
