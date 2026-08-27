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

export function planPricesQueryOptions(currency: string) {
  // No userId gate: plan prices are the same for every viewer, logged in or
  // not (the backend's `planPrices` query is `@Public()`) — this is what
  // lets the guest-facing marketing pricing page reuse this same query.
  return queryOptions({
    queryKey: ["billing", "plan-prices", currency],
    queryFn: async () => {
      const { fetchPlanPricesServer } =
        await import("@/api/server/billing/plan-prices");
      return fetchPlanPricesServer(currency);
    },
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
