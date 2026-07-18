import type { Dispatch, SetStateAction } from "react";

type UserInfo = { id: string; name: string; email: string; avatarUrl: string | null };

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  deliveredAt: string | null;
};

export interface ChatViewProps {
  selectedUser: UserInfo;
  user: UserInfo;
  setSelectedUser: Dispatch<SetStateAction<UserInfo | null>>;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  onlineUsers: Set<string>;
  connectionState: string;
}
