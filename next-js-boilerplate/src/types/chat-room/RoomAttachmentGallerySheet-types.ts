import type { RoomAttachment } from "@/api/server/messages/room-attachments";

export interface RoomAttachmentGallerySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: string | null;
}

export interface RoomAttachmentDayGroup {
  /** Stable key for the Accordion item — the group's local calendar date. */
  key: string;
  isToday: boolean;
  /** First attachment's createdAt, kept to format the non-today label lazily. */
  createdAt: string;
  attachments: RoomAttachment[];
}
