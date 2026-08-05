import { queryOptions } from "@tanstack/react-query";
import type { MessageUsageResult } from "@/api/server/usage/messages";

export function messageUsageQueryOptions(from?: string, to?: string) {
  return queryOptions({
    queryKey: ["usage", "messages", from ?? "month", to ?? "now"],
    queryFn: async (): Promise<MessageUsageResult> => {
      const { fetchMessageUsageServer } =
        await import("@/api/server/usage/messages");
      return fetchMessageUsageServer(from, to);
    },
    staleTime: 60_000,
  });
}
