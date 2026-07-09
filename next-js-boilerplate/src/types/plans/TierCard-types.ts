import type { Tier } from "@/lib/tier";

export interface TierCardProps {
  tier: Tier;
  price: string;
  features: string[];
  current?: boolean;
  ctaLabel: string;
  ctaHref?: string;
  currentLabel: string;
}
