import { queryOptions } from "@tanstack/react-query";

export function apiKeyListQueryOptions() {
  return queryOptions({
    queryKey: ["api-keys", "list"],
    queryFn: async () => {
      const { listApiKeysServer } = await import("@/api/server/api-keys/list");
      return listApiKeysServer();
    },
  });
}
