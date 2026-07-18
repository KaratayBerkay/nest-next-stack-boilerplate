import { apiFetch } from "@/lib/api-client";
import { PREMIUM_STATS_URL } from "@/constants/api/urls";

export interface PremiumStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
}

export async function fetchPremiumStatsServer(): Promise<PremiumStats> {
  const res = await apiFetch(PREMIUM_STATS_URL);
  if (!res.ok) throw new Error("Failed to fetch premium stats");
  return res.json();
}
