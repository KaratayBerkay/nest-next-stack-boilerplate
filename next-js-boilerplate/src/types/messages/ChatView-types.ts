import type { Dispatch, SetStateAction } from "react";

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string | null;
  encrypted?: boolean;
  algVersion?: number | null;
  envelope?: Record<string, unknown> | null;
  createdAt: string;
  readAt: string | null;
  deliveredAt: string | null;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  _tempId?: string;
  pending?: boolean;
  failed?: boolean;
};

export interface ChatViewProps {
  selectedUser: UserInfo;
  user: UserInfo;
  setSelectedUser: Dispatch<SetStateAction<UserInfo | null>>;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  onlineUsers: Set<string>;
  connectionState: string;
}
