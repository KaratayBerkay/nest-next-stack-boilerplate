import { queryOptions } from "@tanstack/react-query";

export function subscriptionQueryOptions(userId?: string) {
  return queryOptions({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      const { fetchSubscriptionServer } =
        await import("@/api/server/billing/subscription");
      return fetchSubscriptionServer();
    },
    enabled: !!userId,
  });
}

export function billingHistoryQueryOptions() {
  return queryOptions({
    queryKey: ["billing", "history"],
    queryFn: async () => {
      const { fetchBillingHistoryServer } =
        await import("@/api/server/billing/history");
      return fetchBillingHistoryServer();
    },
  });
}
