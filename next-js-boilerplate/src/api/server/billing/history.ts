import { apiFetchJson } from "@/lib/api-client";
import { BILLING_HISTORY_URL } from "@/constants/api/urls";

export interface BillingHistoryEntry {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
}

export async function fetchBillingHistoryServer(): Promise<BillingHistoryEntry[]> {
  const data = await apiFetchJson<{ invoices: BillingHistoryEntry[] }>(BILLING_HISTORY_URL);
  return data.invoices;
}
