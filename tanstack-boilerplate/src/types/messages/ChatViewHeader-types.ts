import type { Dispatch, SetStateAction } from "react";
import type { UserInfo } from "./ChatView-types";

export interface ChatViewHeaderProps {
  selectedUser: UserInfo;
  setSelectedUser: Dispatch<SetStateAction<UserInfo | null>>;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  onlineUsers: Set<string>;
  isTyping: boolean;
  /** Called when the user clicks "All uploads" to open the attachment gallery. */
  onOpenGallery?: () => void;
  ownUserId?: string;
  ownFingerprint?: string;
  peerFingerprint?: string;
  /** True when ALL messages in the conversation are stuck encrypted. */
  allEncrypted?: boolean;
  /** Called when the user clicks "Reset Encryption". */
  onResetConversation?: () => void;
  /** Called when the user clicks "Export keys" (downloads a backup file). */
  onExportKeys?: () => void;
  /** Called with the selected file when the user imports a key backup. */
  onImportKeys?: (file: File) => void;
  /** True when a password-encrypted backup exists on the server. */
  hasServerBackup?: boolean;
  /** Called when the user clicks "Restore from server". */
  onRestoreFromServer?: () => void;
}
