export interface ChatRoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar?: string;
  body: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  createdAt: string;
  pending?: boolean;
}
