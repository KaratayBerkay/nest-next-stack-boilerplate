"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { TIER_PRICES_CENTS, tierLabel, type Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { plansPath } from "@/constants/routes";
import { useToast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { useBillingActions } from "@/api/client/billing/actions";

interface PlanDetailsProps {
  tier: Tier;
  periodEnd?: string;
  cancelAtPeriodEnd: boolean;
  pendingTier?: string;
  pendingTierEffectiveAt?: string;
}

async function handleCancel(
  userId: string,
  queryClient: ReturnType<typeof useQueryClient>,
  toast: ReturnType<typeof useToast>["toast"],
  tConfirm: string,
  tSuccess: string,
  tFailed: string,
) {
  if (!window.confirm(tConfirm)) return;
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
    handleCancel(
      "",
      queryClient,
      toast,
      t.cancelSubscriptionConfirm,
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
            {formatPrice(TIER_PRICES_CENTS[tier] ?? 0, "USD")}
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

      <div className="mt-4 flex items-center gap-2">
        {hasPendingChange ? (
          <button
            type="button"
            onClick={onCancelPendingChange}
            className="border-border hover:bg-surface-hover w-full rounded-lg border px-4 py-2 text-sm font-medium"
          >
            {t.cancelPendingChange
              .replace("{tier}", tierLabel(pendingTier ?? tier))
              .replace("{date}", pendingTierEffectiveAt ?? "")}
          </button>
        ) : tier === "FREE" ? (
          <Link
            href={plansPath()}
            className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            {t.upgradePlan}
          </Link>
        ) : (
          <>
            <Link
              href={plansPath()}
              className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              {t.upgradePlan}
            </Link>
            {cancelAtPeriodEnd ? (
              <p className="text-warning text-xs">{t.cancelsOn}</p>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="border-border hover:bg-surface-hover rounded-lg border px-4 py-2 text-sm font-medium"
              >
                {t.cancelSubscription}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
