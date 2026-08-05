export interface ChatRoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar?: string;
  body: string | null;
  algVersion?: number | null;
  envelope?: Record<string, unknown> | null;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  createdAt: string;
  pending?: boolean;
}
