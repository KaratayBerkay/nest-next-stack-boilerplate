import type { Dispatch, SetStateAction } from "react";
import type { MessageAttachment } from "./MessageAttachment-types";

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type ReplyPreview = {
  id: string;
  senderId: string;
  body: string | null;
  deletedAt: string | null;
  hasAttachments: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string | null;
  createdAt: string;
  readAt: string | null;
  deliveredAt: string | null;
  deletedAt: string | null;
  attachments?: MessageAttachment[];
  replyTo?: ReplyPreview | null;
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
