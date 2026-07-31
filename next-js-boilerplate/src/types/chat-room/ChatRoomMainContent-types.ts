import type { Dispatch, RefObject, SetStateAction } from "react";
import type { ChatRoomMessage } from "./ChatRoomMessage-types";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";

export interface ChatRoomMainContentProps {
  useNativeControls: boolean;
  room: string;
  roomCounts: Record<string, number>;
  connectionState: string;
  messages: ChatRoomMessage[];
  userId: string;
  onlineUserIds: Set<string>;
  msgsLoading: boolean;
  msgsError: boolean;
  input: string;
  attaching: boolean;
  pendingAttachment: MessageAttachment | null;
  bottomRef: RefObject<HTMLDivElement | null>;
  messagesRef: RefObject<HTMLDivElement | null>;
  isAtBottom: boolean;
  t: Record<string, string>;
  tErr: Record<string, string>;
  onSetSidebarOpen: (open: boolean) => void;
  onSetInput: Dispatch<SetStateAction<string>>;
  onSend: () => void;
  onAttachFile: (file: File) => void;
  onRemoveAttachment: () => void;
}
