import type { Dispatch, SetStateAction } from "react";
import type { UserInfo } from "@/types/messages/FreePageView-types";

export function openConversationAction(
  u: UserInfo,
  markMessagesRead: (userId: string) => void,
  setSelectedUser: Dispatch<SetStateAction<UserInfo | null>>,
  setSidebarOpen: Dispatch<SetStateAction<boolean>>,
) {
  setSelectedUser(u);
  setSidebarOpen(false);
  markMessagesRead(u.id);
}
