import type { Dispatch, SetStateAction } from "react";

export interface MessagesSidebarSearchProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}
