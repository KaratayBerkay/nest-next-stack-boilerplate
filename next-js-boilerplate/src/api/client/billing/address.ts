import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

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
    mutationFn: async (input: {
      name?: string;
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
      vatNumber?: string;
    }) => {
      const { upsertBillingAddressServer } =
        await import("@/api/server/billing/address");
      return upsertBillingAddressServer(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "address"] });
    },
  });
}
