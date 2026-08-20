import type { Dispatch, RefObject, SetStateAction } from "react";
import type { ChatRoomMessage } from "./ChatRoomMessage-types";
import type { UploadItem } from "@/types/messages/AttachmentModal-types";

export interface ChatRoomMainContentProps {
  room: string;
  roomCounts: Record<string, number>;
  connectionState: string;
  messages: ChatRoomMessage[];
  userId: string;
  onlineUserIds: Set<string>;
  msgsLoading: boolean;
  msgsError: boolean;
  hasNextPage: boolean;
  onFetchNextPage: () => void;
  input: string;
  attaching: boolean;
  uploadItems: UploadItem[];
  bottomRef: RefObject<HTMLDivElement | null>;
  messagesRef: RefObject<HTMLDivElement | null>;
  isAtBottom: boolean;
  /** Called when the user clicks "All uploads" to open the attachment gallery. */
  onOpenGallery?: () => void;
  t: Record<string, string>;
  tErr: Record<string, string>;
  onSetSidebarOpen: (open: boolean) => void;
  onSetInput: Dispatch<SetStateAction<string>>;
  onSend: () => void;
  onAttachFiles: (files: File[]) => void;
  onRemoveUploadItem: (id: string) => void;
  onCancelUploads: () => void;
  onSendAttachments: () => void;
}
