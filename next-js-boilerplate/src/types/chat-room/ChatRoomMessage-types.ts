import type { MessageAttachment } from "../messages/MessageAttachment-types";
import type { ReplyPreview } from "../messages/ChatView-types";

/**
 * Quoted-reply preview for a room message — the DM ReplyPreview shape plus
 * the quoted author's display name (rooms have many senders, so "you vs the
 * peer" isn't enough to label the quote).
 */
export type RoomReplyPreview = ReplyPreview & { senderName?: string };

/** What the composer holds while the user is replying to a room message. */
export type RoomReplyTarget = ReplyPreview & { senderName: string };

export interface ChatRoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar?: string;
  body: string | null;
  attachments?: MessageAttachment[];
  createdAt: string;
  pending?: boolean;
  failed?: boolean;
  /** "Delete for everyone" tombstone (CROSS-024): body/attachments are empty when set. */
  deletedAt?: string | null;
  /** Quoted message this one replies to, if any (CROSS-024). */
  replyTo?: RoomReplyPreview | null;
}
