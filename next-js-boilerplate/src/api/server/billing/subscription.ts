import { apiFetchJson } from "@/lib/api-client";
import { BILLING_SUBSCRIPTION_URL } from "@/constants/api/urls";

export interface SubscriptionInfo {
  tier: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export async function fetchSubscriptionServer(): Promise<SubscriptionInfo> {
  return apiFetchJson<SubscriptionInfo>(BILLING_SUBSCRIPTION_URL);
}
