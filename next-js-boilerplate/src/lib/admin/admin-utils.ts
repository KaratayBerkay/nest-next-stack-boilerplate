import type { Dispatch, SetStateAction, MutableRefObject } from "react";
import { searchAdminUsersServer } from "@/api/server/admin/search-users";
import { setTierServer } from "@/api/server/admin/set-tier";

export interface UserResult {
  id: string;
  name: string;
  email: string;
}

export async function doSearch(
  q: string,
  setResults: Dispatch<SetStateAction<UserResult[]>>,
  setSearching: Dispatch<SetStateAction<boolean>>,
) {
  if (q.trim().length < 2) {
    setResults([]);
    return;
  }
  setSearching(true);
  try {
    const items = await searchAdminUsersServer(q);
    setResults(items);
  } catch {
    setResults([]);
  } finally {
    setSearching(false);
  }
}

export function onQueryChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setQuery: Dispatch<SetStateAction<string>>,
  setResults: Dispatch<SetStateAction<UserResult[]>>,
  setSearching: Dispatch<SetStateAction<boolean>>,
  searchTimer: MutableRefObject<ReturnType<typeof setTimeout> | undefined>,
) {
  const q = e.target.value;
  setQuery(q);
  if (searchTimer.current) clearTimeout(searchTimer.current);
  searchTimer.current = setTimeout(
    () => doSearch(q, setResults, setSearching),
    300,
  );
}

export async function setTier(
  userId: string,
  tier: string,
  setStatusMsg: Dispatch<
    SetStateAction<{ type: "success" | "error"; text: string } | null>
  >,
) {
  setStatusMsg(null);
  try {
    const result = await setTierServer(userId, tier);
    if (result.success) {
      setStatusMsg({ type: "success", text: "Tier updated successfully" });
    } else {
      setStatusMsg({
        type: "error",
        text: result.error ?? "Failed to update tier",
      });
    }
  } catch {
    setStatusMsg({ type: "error", text: "Network error" });
  }
}
