import { queryOptions } from "@tanstack/react-query";
import { getBundleStatusServer } from "@/api/server/e2ee/bundle-status";

export function bundleStatusQueryOptions(userId: string | undefined) {
  return queryOptions({
    queryKey: ["e2ee", "bundle-status", userId],
    queryFn: () => getBundleStatusServer(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}
