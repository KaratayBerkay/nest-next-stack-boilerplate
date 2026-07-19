import { queryOptions } from "@tanstack/react-query";

export function feedListQueryOptions(
  take: number,
  cursor: string | null | undefined,
  search?: string,
) {
  const p = new URLSearchParams();
  p.set("take", String(take));
  if (cursor) p.set("cursor", cursor);
  if (search) p.set("search", search);

  return queryOptions({
    queryKey: ["feed", "list", search, cursor],
    queryFn: async () => {
      const { fetchFeedListServer } = await import("@/api/server/posts/list");
      return fetchFeedListServer(take, cursor, search);
    },
    staleTime: 30_000,
  });
}

export function singlePostQueryOptions(uuid: string) {
  return queryOptions({
    queryKey: ["posts", uuid],
    queryFn: async () => {
      const { fetchSinglePostServer } =
        await import("@/api/server/posts/single");
      return fetchSinglePostServer(uuid);
    },
  });
}
