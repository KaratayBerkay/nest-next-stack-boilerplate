import { queryOptions } from "@tanstack/react-query";
import { apiFetchJson } from "@/lib/api-client";
import { USERS_SEARCH_PREFIX } from "@/constants/api/urls";
import type { UserSearchResult } from "@/api/server/users/search";

export function searchUsersQueryOptions(q: string, take: number, skip: number) {
  return queryOptions({
    queryKey: ["users", "search", q, take, skip],
    queryFn: async () => {
      const url = `${USERS_SEARCH_PREFIX}?q=${encodeURIComponent(q)}&take=${take}&skip=${skip}`;
      return apiFetchJson<UserSearchResult>(url);
    },
    enabled: q.trim().length >= 3,
  });
}
