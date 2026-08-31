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

export interface PlanDetailsActionsProps {
  hasPendingChange: boolean;
  tier: Tier;
  cancelAtPeriodEnd: boolean;
  onCancel: () => void;
  onCancelPendingChange: () => void;
  cancelingPendingChange: boolean;
  upgradePlanLabel: string;
  cancelPendingChangeLabel: string;
  cancelSubscriptionLabel: string;
  cancelSubscriptionConfirmLabel: string;
  cancelsOnLabel: string;
}
