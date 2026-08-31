import { queryOptions } from "@tanstack/react-query";
import type { MessageUsageResult } from "@/api/server/usage/messages";
import type { UploadStorageUsageResult } from "@/api/server/usage/storage";

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

export function storageUsageQueryOptions() {
  return queryOptions({
    queryKey: ["usage", "storage"],
    queryFn: async (): Promise<UploadStorageUsageResult> => {
      const { fetchStorageUsageServer } =
        await import("@/api/server/usage/storage");
      return fetchStorageUsageServer();
    },
    staleTime: 60_000,
  });
}
