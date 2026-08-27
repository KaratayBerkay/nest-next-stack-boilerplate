import type { Dispatch, RefObject, SetStateAction } from "react";
import type { UploadItem } from "./AttachmentModal-types";

export interface ChatInputBarProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  messageError: string | null;
  handleSend: () => void;
  connectionState: string;
  inputPlaceholder: string;
  connectingLabel: string;
  attachFileLabel: string;
  insertEmojiLabel: string;
  sendLabel: string;
  recipientId: string;
  onTypingStart: (recipientId: string) => void;
  onTypingStop: (recipientId: string) => void;
  attaching: boolean;
  uploadItems: UploadItem[];
  onAttachFiles: (files: File[]) => void;
  chatWindowRef?: RefObject<HTMLDivElement | null>;
}
