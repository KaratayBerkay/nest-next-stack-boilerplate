import { queryOptions } from "@tanstack/react-query";

export function sessionsListQueryOptions() {
  return queryOptions({
    queryKey: ["sessions", "list"],
    queryFn: async () => {
      const { listSessionsServer } = await import("@/api/server/sessions/list");
      return listSessionsServer();
    },
  });
}
