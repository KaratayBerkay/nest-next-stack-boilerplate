import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function paymentMethodsQueryOptions() {
  return queryOptions({
    queryKey: ["billing", "payment-methods"],
    queryFn: async () => {
      const { fetchPaymentMethodsServer } =
        await import("@/api/server/billing/payment-methods");
      return fetchPaymentMethodsServer();
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const { setDefaultPaymentMethodServer } =
        await import("@/api/server/billing/payment-methods");
      return setDefaultPaymentMethodServer(paymentMethodId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["billing", "payment-methods"],
      });
    },
  });
}

export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const { removePaymentMethodServer } =
        await import("@/api/server/billing/payment-methods");
      return removePaymentMethodServer(paymentMethodId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["billing", "payment-methods"],
      });
    },
  });
}
