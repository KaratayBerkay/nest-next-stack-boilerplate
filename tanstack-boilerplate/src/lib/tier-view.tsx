import { type Tier, TIER_ORDER } from "./tier";
import type { ComponentType, ReactNode } from "react";

type TierViews = Record<Tier, ComponentType<Record<string, unknown>>>;

const FALLBACK_TIER: Tier = "FREE";

export function getTierView<T extends TierViews>(
  tier: string | null | undefined,
  views: T,
  props?: Record<string, unknown>,
): ReactNode {
  const View =
    tier && tier in views && tier in TIER_ORDER
      ? views[tier as Tier]
      : views[FALLBACK_TIER];
  return <View {...props} />;
}
