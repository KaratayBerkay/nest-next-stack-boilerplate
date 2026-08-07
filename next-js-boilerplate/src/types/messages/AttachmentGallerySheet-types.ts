import type { ConversationAttachment } from "@/api/server/messages/conversation-attachments";

export interface AttachmentGallerySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peerId: string | null;
}

export interface AttachmentDayGroup {
  /** Stable key for the Accordion item — the group's local calendar date. */
  key: string;
  isToday: boolean;
  /** First attachment's createdAt, kept to format the non-today label lazily. */
  createdAt: string;
  attachments: ConversationAttachment[];
}
