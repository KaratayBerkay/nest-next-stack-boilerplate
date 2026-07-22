import type { Dispatch, SetStateAction } from "react";
import type { UserInfo } from "./ChatView-types";

export interface MessagesSidebarSearchProps {
  tab: "conversations" | "friends";
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  findInput: string;
  setFindInput: Dispatch<SetStateAction<string>>;
  findResults: UserInfo[];
  user: UserInfo;
  friends: UserInfo[];
  sentRequestIds: Set<string>;
  setSentRequestIds: Dispatch<SetStateAction<Set<string>>>;
  debouncedSearch: (val: string) => void;
}
