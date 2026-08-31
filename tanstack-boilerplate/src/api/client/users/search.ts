import { queryOptions } from "@tanstack/react-query";

export function searchUsersQueryOptions(q: string, take: number, skip: number) {
  return queryOptions({
    queryKey: ["users", "search", q, take, skip],
    queryFn: async () => {
      const { searchUsersServer } = await import("@/api/server/users/search");
      return searchUsersServer(q, take, skip);
    },
    enabled: q.trim().length >= 3,
  });
}
