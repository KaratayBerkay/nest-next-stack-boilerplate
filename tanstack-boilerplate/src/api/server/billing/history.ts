import { apiFetchJson } from "@/lib/api-client";
import { BILLING_HISTORY_URL } from "@/constants/api/urls";
import type { Transaction } from "@/types/billing/FreePageView-types";

export type BillingHistoryEntry = Transaction;

export async function fetchBillingHistoryServer(): Promise<
  BillingHistoryEntry[]
> {
  const data = await apiFetchJson<{ transactions: BillingHistoryEntry[] }>(
    BILLING_HISTORY_URL,
  );
  return data.transactions;
}
