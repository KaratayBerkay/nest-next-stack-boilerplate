import type { Dispatch, SetStateAction } from "react";
import type { UserInfo } from "@/types/messages/FreePageView-types";

export function openConversationAction(
  u: UserInfo,
  markMessagesRead: (userId: string) => void,
  setSelectedUser: Dispatch<SetStateAction<UserInfo | null>>,
  setTab: Dispatch<SetStateAction<"conversations" | "friends">>,
  setSidebarOpen: Dispatch<SetStateAction<boolean>>,
) {
  setSelectedUser(u);
  setTab("conversations");
  setSidebarOpen(false);
  markMessagesRead(u.id);
}
