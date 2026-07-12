import type { Dispatch, SetStateAction, MutableRefObject } from "react";
import { apiFetch } from "@/lib/api-client";
import { ADMIN_SET_TIER_URL, USERS_SEARCH_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

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
    const res = await apiFetch(
      `${USERS_SEARCH_PREFIX}?q=${encodeURIComponent(q)}&take=20`,
    );
    if (res.ok) {
      const data = await res.json();
      setResults(data.items ?? []);
    }
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
    const res = await apiFetch(ADMIN_SET_TIER_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ userId, tier }),
    });
    if (res.ok) {
      setStatusMsg({ type: "success", text: "Tier updated successfully" });
    } else {
      const data = await res.json();
      setStatusMsg({
        type: "error",
        text: data.error ?? "Failed to update tier",
      });
    }
  } catch {
    setStatusMsg({ type: "error", text: "Network error" });
  }
}
