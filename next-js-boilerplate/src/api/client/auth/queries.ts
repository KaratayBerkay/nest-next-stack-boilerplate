import { queryOptions } from "@tanstack/react-query";

export function meQueryOptions() {
  return queryOptions({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { getMeServer } = await import("@/api/server/auth/me");
      return getMeServer();
    },
  });
}
