import type { Dispatch, SetStateAction } from "react";
import type { UserInfo } from "./ChatView-types";

export interface ChatViewHeaderProps {
  selectedUser: UserInfo;
  setSelectedUser: Dispatch<SetStateAction<UserInfo | null>>;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  onlineUsers: Set<string>;
  isTyping: boolean;
  ownUserId?: string;
  ownFingerprint?: string;
  peerFingerprint?: string;
  /** True when ALL messages in the conversation are stuck encrypted. */
  allEncrypted?: boolean;
  /** Called when the user clicks "Reset Encryption". */
  onResetConversation?: () => void;
}
