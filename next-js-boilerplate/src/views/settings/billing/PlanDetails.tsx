"use client";

import { useCallback } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Tier } from "@/lib/tier";
import { tierLabel } from "@/lib/tier";
import { formatPrice, toCurrencyCode } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { useBillingActions } from "@/api/client/billing/actions";
import type { PlanDetailsProps } from "@/types/views/settings/PlanDetails-types";
import { PlanDetailsActions } from "./PlanDetailsActions";

async function handleCancel(
  queryClient: ReturnType<typeof useQueryClient>,
  toast: ReturnType<typeof useToast>["toast"],
  tSuccess: string,
  tFailed: string,
) {
  try {
    const { cancelSubscriptionServer } =
      await import("@/api/server/billing/cancel");
    await cancelSubscriptionServer();
    toast({ title: tSuccess });
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
  } catch {
    toast({ title: tFailed, variant: "destructive" });
  }
}

async function handleCancelPendingChange(
  tier: Tier,
  queryClient: ReturnType<typeof useQueryClient>,
  toast: ReturnType<typeof useToast>["toast"],
  subscribe: (
    tier: string,
    paymentMethodId?: string,
    idempotencyKey?: string,
    currentTier?: string,
  ) => Promise<unknown>,
  tSuccess: string,
  tFailed: string,
) {
  try {
    // Re-selecting the current tier while a change is pending releases the
    // Stripe schedule and clears the pending fields (T6 escape hatch).
    await subscribe(tier, undefined, undefined, tier);
    toast({ title: tSuccess });
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
  } catch {
    toast({ title: tFailed, variant: "destructive" });
  }
}

export function PlanDetails({
  tier,
  priceCents,
  currency,
  periodEnd,
  cancelAtPeriodEnd,
  pendingTier,
  pendingTierEffectiveAt,
}: PlanDetailsProps) {
  const t = useMessages("settings") as unknown as Record<string, string>;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscribe } = useBillingActions();

  const onCancel = useCallback(() => {
    return handleCancel(
      queryClient,
      toast,
      t.cancelSubscriptionSuccess,
      t.cancelSubscriptionFailed,
    );
  }, [queryClient, toast, t]);

  const onCancelPendingChange = useCallback(() => {
    handleCancelPendingChange(
      tier,
      queryClient,
      toast,
      subscribe,
      t.cancelPendingChangeSuccess,
      t.cancelPendingChangeFailed,
    );
  }, [tier, queryClient, toast, subscribe, t]);

  const hasPendingChange = Boolean(pendingTier && pendingTierEffectiveAt);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{t.planDetails}</h3>
      <ul className="divide-border flex flex-col divide-y">
        <li className="flex items-center justify-between py-2.5">
          <span className="text-muted text-sm">{t.currentPlan}</span>
          <span className="text-sm font-medium">{tierLabel(tier)}</span>
        </li>
        <li className="flex items-center justify-between py-2.5">
          <span className="text-muted text-sm">{t.price}</span>
          <span className="text-sm font-medium">
            {formatPrice(priceCents, toCurrencyCode(currency))}
          </span>
        </li>
        {tier !== "FREE" && periodEnd && (
          <li className="flex items-center justify-between py-2.5">
            <span className="text-muted text-sm">
              {cancelAtPeriodEnd ? t.cancelsOn : t.renewalDate}
            </span>
            <span className="text-sm font-medium">{periodEnd}</span>
          </li>
        )}
        {pendingTier && pendingTierEffectiveAt && (
          <li className="flex items-center justify-between py-2.5">
            <span className="text-muted text-sm">{t.planChangesOn}</span>
            <span className="text-sm font-medium">
              {tierLabel(pendingTier)} — {pendingTierEffectiveAt}
            </span>
          </li>
        )}
      </ul>

      {pendingTier && pendingTierEffectiveAt && (
        <p className="text-warning text-xs">
          {t.planChangeScheduled
            .replace("{tier}", tierLabel(pendingTier))
            .replace("{date}", pendingTierEffectiveAt)}
        </p>
      )}

      <PlanDetailsActions
        hasPendingChange={hasPendingChange}
        tier={tier}
        cancelAtPeriodEnd={cancelAtPeriodEnd}
        onCancel={onCancel}
        onCancelPendingChange={onCancelPendingChange}
        upgradePlanLabel={t.upgradePlan}
        cancelPendingChangeLabel={t.cancelPendingChange
          .replace("{tier}", tierLabel(pendingTier ?? tier))
          .replace("{date}", pendingTierEffectiveAt ?? "")}
        cancelSubscriptionLabel={t.cancelSubscription}
        cancelSubscriptionConfirmLabel={t.cancelSubscriptionConfirm}
        cancelsOnLabel={t.cancelsOn}
      />
    </div>
  );
}
