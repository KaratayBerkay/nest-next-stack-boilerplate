import { queryOptions } from "@tanstack/react-query";
import type { PremiumStats } from "@/api/server/premium/stats";

async function fetchPremiumStats(): Promise<PremiumStats> {
  const { fetchPremiumStatsServer } =
    await import("@/api/server/premium/stats");
  return fetchPremiumStatsServer();
}

export function premiumStatsQueryOptions() {
  return queryOptions({
    queryKey: ["premium", "stats"],
    queryFn: fetchPremiumStats,
    staleTime: 60_000,
  });
}
