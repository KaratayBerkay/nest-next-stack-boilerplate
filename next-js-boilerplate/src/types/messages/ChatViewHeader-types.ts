import type { Dispatch, SetStateAction } from "react";
import type { UserInfo } from "./ChatView-types";

export interface ChatViewHeaderProps {
  selectedUser: UserInfo;
  setSelectedUser: Dispatch<SetStateAction<UserInfo | null>>;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  onlineUsers: Set<string>;
}
