import { type Tier, TIER_ORDER } from './tier';
import type { ComponentType } from 'react';

type TierViews = Record<Tier, ComponentType>;

const FALLBACK_TIER: Tier = 'FREE';

export function getTierView<T extends TierViews>(
  tier: string | null | undefined,
  views: T,
): ComponentType {
  if (tier && tier in views && tier in TIER_ORDER) {
    return views[tier as Tier];
  }
  return views[FALLBACK_TIER];
}
