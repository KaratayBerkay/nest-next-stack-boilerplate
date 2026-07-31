import type { Dispatch, SetStateAction } from "react";
import type { MessageAttachment } from "./MessageAttachment-types";

export interface ChatInputBarProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  messageError: string | null;
  handleSend: () => void;
  connectionState: string;
  inputPlaceholder: string;
  connectingLabel: string;
  recipientId: string;
  onTypingStart: (recipientId: string) => void;
  onTypingStop: (recipientId: string) => void;
  attaching: boolean;
  pendingAttachment: MessageAttachment | null;
  onAttachFile: (file: File) => void;
  onRemoveAttachment: () => void;
}
