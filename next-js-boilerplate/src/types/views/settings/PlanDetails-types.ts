import type { Tier } from "@/lib/tier";

export interface PlanDetailsProps {
  tier: Tier;
  priceCents: number;
  currency: string;
  periodEnd?: string;
  cancelAtPeriodEnd: boolean;
  pendingTier?: string;
  pendingTierEffectiveAt?: string;
}
