import type { MessageAttachment } from "./MessageAttachment-types";

export type UploadItemStatus = "uploading" | "done" | "error";

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadItemStatus;
  attachment?: MessageAttachment;
}

export interface AttachmentModalProps {
  open: boolean;
  items: UploadItem[];
  t: Record<string, string>;
  onSend: () => void;
  onRemoveItem: (id: string) => void;
  onAddFiles: (files: File[]) => void;
  onCancel: () => void;
}
