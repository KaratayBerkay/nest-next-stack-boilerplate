import { apiFetch } from "@/lib/api-client";
import { USAGE_MESSAGES_URL } from "@/constants/api/urls";

export type SubscriptionTier = "FREE" | "BASIC" | "MEDIUM" | "PREMIUM";

export interface MessageUsageResult {
  letters: number;
  bytes: number;
  limitBytes: number;
  tier: SubscriptionTier;
  multiplier: number;
  from: string;
  to: string;
}

export async function fetchMessageUsageServer(
  from?: string,
  to?: string,
): Promise<MessageUsageResult> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  const res = await apiFetch(`${USAGE_MESSAGES_URL}${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch message usage");
  return (await res.json()) as MessageUsageResult;
}
