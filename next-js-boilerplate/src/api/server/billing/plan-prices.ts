import { apiFetchJson } from "@/lib/api-client";
import { BILLING_PLAN_PRICES_URL } from "@/constants/api/urls";

export interface PlanPrice {
  tier: string;
  priceCents: number;
  currency: string;
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
