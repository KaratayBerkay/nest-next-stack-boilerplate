import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { BillingAddress } from "@/api/server/billing/address";

export function billingAddressQueryOptions() {
  return queryOptions({
    queryKey: ["billing", "address"],
    queryFn: async () => {
      const { fetchBillingAddressServer } =
        await import("@/api/server/billing/address");
      return fetchBillingAddressServer();
    },
  });
}

export function useUpsertBillingAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<BillingAddress>) => {
      const { upsertBillingAddressServer } =
        await import("@/api/server/billing/address");
      return upsertBillingAddressServer(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "address"] });
    },
  });
}
