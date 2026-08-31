import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { CallHistoryPage } from "@/api/server/rtc/call-history";
import type { ActiveCallSnapshot } from "@/api/server/rtc/active-call";

async function fetchCallHistory(before?: string): Promise<CallHistoryPage> {
  const { fetchCallHistoryServer } =
    await import("@/api/server/rtc/call-history");
  return fetchCallHistoryServer(before);
}

export function callHistoryQueryOptions() {
  return infiniteQueryOptions<CallHistoryPage>({
    queryKey: ["rtc", "call-history"],
    queryFn: async ({ pageParam }) =>
      fetchCallHistory(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.calls[lastPage.calls.length - 1]?.ringingAt
        : undefined,
    staleTime: 30_000,
  });
}

export function activeCallQueryOptions() {
  return queryOptions<ActiveCallSnapshot | null>({
    queryKey: ["rtc", "active-call"],
    queryFn: async () => {
      const { fetchActiveCallServer } =
        await import("@/api/server/rtc/active-call");
      return fetchActiveCallServer();
    },
    staleTime: 0,
  });
}
