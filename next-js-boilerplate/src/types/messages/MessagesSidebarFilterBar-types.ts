import type { Dispatch, SetStateAction } from "react";
import type { UserInfo } from "./ChatView-types";

export type SidebarFilter = "all" | "unread" | "favorites" | "groups";

export interface MessagesSidebarFilterBarProps {
  filter: SidebarFilter;
  setFilter: Dispatch<SetStateAction<SidebarFilter>>;
  lang: string;
  friends: UserInfo[];
  openConversation: (u: UserInfo) => void;
}
