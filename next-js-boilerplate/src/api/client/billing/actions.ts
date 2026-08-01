export function useBillingActions() {
  const createSetupIntent = async (tier: string) => {
    const { createSetupIntentServer } =
      await import("@/api/server/billing/stripe");
    return createSetupIntentServer(tier);
  };

  const subscribe = async (
    tier: string,
    paymentMethodId?: string,
    idempotencyKey?: string,
    currentTier?: string,
  ) => {
    const { subscribeServer } = await import("@/api/server/billing/stripe");
    return subscribeServer(tier, paymentMethodId, idempotencyKey, currentTier);
  };

  const cancelSubscription = async () => {
    const { cancelSubscriptionServer } =
      await import("@/api/server/billing/cancel");
    await cancelSubscriptionServer();
  };

  return { createSetupIntent, subscribe, cancelSubscription };
}
