"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Tier } from "@/lib/tier";
import { tierLabel } from "@/lib/tier";
import { formatPrice, toCurrencyCode } from "@/lib/currency";
import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
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
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  retryKeyRef: React.MutableRefObject<string | null>,
) {
  setSubmitting(true);
  try {
    // Re-selecting the current tier while a change is pending releases the
    // Stripe schedule and clears the pending fields (T6 escape hatch). One
    // idempotency key per attempt, reused across a failure-then-retry —
    // same reasoning as DowngradeSection's retryKeyRef: this call had no
    // dedup key and no submit guard, so a double-click fired two concurrent
    // subscribe mutations racing on the same schedule.
    const retryKey =
      retryKeyRef.current ?? (retryKeyRef.current = crypto.randomUUID());
    await subscribe(tier, undefined, retryKey, tier);
    retryKeyRef.current = null;
    toast({ title: tSuccess });
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
  } catch {
    toast({ title: tFailed, variant: "destructive" });
  } finally {
    setSubmitting(false);
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
  const dateDisplay = useDateDisplayCookie();
  const [cancelingPendingChange, setCancelingPendingChange] = useState(false);
  const retryKeyRef = useRef<string | null>(null);
  const formattedPeriodEnd = periodEnd
    ? formatDateByPreference(periodEnd, dateDisplay)
    : periodEnd;
  const formattedPendingEffectiveAt = pendingTierEffectiveAt
    ? formatDateByPreference(pendingTierEffectiveAt, dateDisplay)
    : pendingTierEffectiveAt;

  useEffect(() => {
    retryKeyRef.current = crypto.randomUUID();
  }, [tier, pendingTier]);

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
      setCancelingPendingChange,
      retryKeyRef,
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
            {formatPrice(priceCents, toCurrencyCode(currency), t.free)}
          </span>
        </li>
        {tier !== "FREE" && periodEnd && (
          <li className="flex items-center justify-between py-2.5">
            <span className="text-muted text-sm">
              {cancelAtPeriodEnd ? t.cancelsOn : t.renewalDate}
            </span>
            <span className="text-sm font-medium">{formattedPeriodEnd}</span>
          </li>
        )}
        {pendingTier && pendingTierEffectiveAt && (
          <li className="flex items-center justify-between py-2.5">
            <span className="text-muted text-sm">{t.planChangesOn}</span>
            <span className="text-sm font-medium">
              {tierLabel(pendingTier)} — {formattedPendingEffectiveAt}
            </span>
          </li>
        )}
      </ul>

      {pendingTier && pendingTierEffectiveAt && (
        <p className="text-warning text-xs">
          {t.planChangeScheduled
            .replace("{tier}", tierLabel(pendingTier))
            .replace("{date}", formattedPendingEffectiveAt ?? "")}
        </p>
      )}

      <PlanDetailsActions
        hasPendingChange={hasPendingChange}
        tier={tier}
        cancelAtPeriodEnd={cancelAtPeriodEnd}
        onCancel={onCancel}
        onCancelPendingChange={onCancelPendingChange}
        cancelingPendingChange={cancelingPendingChange}
        upgradePlanLabel={t.upgradePlan}
        cancelPendingChangeLabel={t.cancelPendingChange
          .replace("{tier}", tierLabel(pendingTier ?? tier))
          .replace("{date}", formattedPendingEffectiveAt ?? "")}
        cancelSubscriptionLabel={t.cancelSubscription}
        cancelSubscriptionConfirmLabel={t.cancelSubscriptionConfirm}
        cancelsOnLabel={t.cancelsOn}
      />
    </div>
  );
}
