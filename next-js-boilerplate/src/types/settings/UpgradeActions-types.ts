import type { Tier } from "@/lib/tier";

export interface UpgradeActionsProps {
  tier: Tier;
  t: Record<string, string>;
  lang: string;
}
