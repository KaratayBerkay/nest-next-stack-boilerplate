import type { MessageAttachment } from "../messages/MessageAttachment-types";

export interface ChatRoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar?: string;
  body: string | null;
  attachments?: MessageAttachment[];
  createdAt: string;
  pending?: boolean;
}
