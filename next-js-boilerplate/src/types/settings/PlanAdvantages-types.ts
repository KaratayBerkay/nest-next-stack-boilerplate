import type { Tier } from "@/lib/tier";

export interface PlanAdvantagesProps {
  tier: Tier;
  features: Record<Tier, string[]>;
}
