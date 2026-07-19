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

  return { createSetupIntent, subscribe };
}
