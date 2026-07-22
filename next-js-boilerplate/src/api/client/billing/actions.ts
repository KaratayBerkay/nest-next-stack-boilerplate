export function useBillingActions() {
  const createSetupIntent = async (tier: string) => {
    const { createSetupIntentServer } =
      await import("@/api/server/billing/stripe");
    return createSetupIntentServer(tier);
  };

  const subscribe = async (tier: string, paymentMethodId?: string) => {
    const { subscribeServer } = await import("@/api/server/billing/stripe");
    await subscribeServer(tier, paymentMethodId);
  };

  const cancelSubscription = async () => {
    const { cancelSubscriptionServer } = await import("@/api/server/billing/cancel");
    await cancelSubscriptionServer();
  };

  return { createSetupIntent, subscribe, cancelSubscription };
}
