import type { Dispatch, SetStateAction } from "react";

export interface MessagesSidebarTabBarProps {
  tab: "conversations" | "friends";
  setTab: Dispatch<SetStateAction<"conversations" | "friends">>;
  lang: string;
}
