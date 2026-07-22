import { apiFetchJson } from "@/lib/api-client";
import { BILLING_SUBSCRIPTION_URL } from "@/constants/api/urls";

export interface SubscriptionInfo {
  tier: string;
  priceCents: number;
  currency: string;
  periodStart?: string;
  periodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

type SubscriptionResponse = {
  subscription: SubscriptionInfo | null;
};

export async function fetchSubscriptionServer(): Promise<SubscriptionInfo | null> {
  const data = await apiFetchJson<SubscriptionResponse>(BILLING_SUBSCRIPTION_URL);
  return data.subscription;
}
