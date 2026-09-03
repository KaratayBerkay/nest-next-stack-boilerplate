import { apiFetchJson } from "@/lib/api-client";
import { BILLING_PLAN_PRICES_URL } from "@/constants/api/urls";

/** CROSS-031: one entry of the backend's canonical per-tier feature list. */
export interface TierFeatureDescriptor {
  key: string;
  value?: string | null;
}

export interface PlanPrice {
  tier: string;
  priceCents: number;
  currency: string;
  /** CROSS-031: what the tier includes — translated client-side by key. */
  features?: TierFeatureDescriptor[];
}

interface PlanPricesResponse {
  prices: PlanPrice[];
}

export async function fetchPlanPricesServer(
  currency?: string,
): Promise<PlanPrice[]> {
  const url = currency
    ? `${BILLING_PLAN_PRICES_URL}?currency=${encodeURIComponent(currency)}`
    : BILLING_PLAN_PRICES_URL;
  const data = await apiFetchJson<PlanPricesResponse>(url);
  return data.prices;
}
