import { apiFetchJson } from "@/lib/api-client";
import { USERS_SEARCH_PREFIX } from "@/constants/api/urls";

export interface UserSearchResult {
  items: Array<{ id: string; name: string; email: string }>;
  total: number;
}

export async function searchUsersServer(
  q: string,
  take: number,
  skip: number,
): Promise<UserSearchResult> {
  const url = `${USERS_SEARCH_PREFIX}?q=${encodeURIComponent(q)}&take=${take}&skip=${skip}`;
  return apiFetchJson<UserSearchResult>(url);
}
