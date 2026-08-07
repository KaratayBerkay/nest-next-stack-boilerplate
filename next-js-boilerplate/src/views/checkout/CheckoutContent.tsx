"use client";

import { use, useState, type Dispatch, type SetStateAction } from "react";
import type { CheckoutPageProps } from "@/types/checkout/CheckoutPage-types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  TIER_ORDER,
  TIER_PRICES_CENTS,
  tierLabel,
  type Tier,
} from "@/lib/tier";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { planPricesQueryOptions } from "@/api/client/billing/query";
import { PRICING_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cn } from "@/lib/cn";
import {
  resolveChangeType,
  buildSuccessMessage,
} from "@/lib/checkout/plan-change";
import { CheckoutSuccessView } from "./CheckoutSuccessView";
import { PlanSummaryCard } from "./PlanSummaryCard";
import { DowngradeSection } from "./DowngradeSection";

const StripeCardForm = dynamic(
  () =>
    import("@/features/billing/ui/StripeCardForm").then(
      (mod) => mod.StripeCardForm,
    ),
  { ssr: false },
);

function onUpgradeSuccess(
  setSuccess: Dispatch<SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
  refreshUser: () => Promise<void>,
) {
  refreshUser().then(() => {
    setSuccess(true);
    setTimeout(() => router.push(PRICING_PATH), 2000);
  });
}

function onChangeApplied(
  setScheduledEffectiveAt: Dispatch<SetStateAction<string | null>>,
  setSuccess: Dispatch<SetStateAction<boolean>>,
  effectiveAt: string | null,
) {
  setScheduledEffectiveAt(effectiveAt);
  setSuccess(true);
}

export default function CheckoutPage({ params, className }: CheckoutPageProps) {
  const { lang: _lang, tier: targetTier } = use(params);
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const t = useMessages("checkout");
  const currency = useCurrencyCookie();
  const { data: priceData } = useQuery(
    planPricesQueryOptions(currency, user?.id),
  );
  const priceCents =
    priceData?.find((p) => p.tier === targetTier)?.priceCents ??
    TIER_PRICES_CENTS[targetTier as Tier] ??
    0;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [scheduledEffectiveAt, setScheduledEffectiveAt] = useState<
    string | null
  >(null);

  const currentRank = TIER_ORDER[user!.tier as Tier] ?? 0;
  const targetRank = TIER_ORDER[targetTier as Tier] ?? 0;
  const isDowngrade = targetRank < currentRank;
  const isCurrent = targetRank === currentRank;
  const changeType = resolveChangeType(user?.tier, targetTier);
  const isScheduled = changeType === "scheduled";

  if (success) {
    const message = buildSuccessMessage(
      changeType,
      scheduledEffectiveAt,
      targetTier,
      _lang,
      t,
    );
    return (
      <CheckoutSuccessView
        isDowngrade={isDowngrade}
        downgradeMsg={t.planChanged}
        upgradeMsg={t.upgradeSuccess}
        message={message}
        redirectingMsg={t.redirecting}
        className={className}
      />
    );
  }

  return (
    <div className={cn("flex h-full w-full flex-col gap-6 py-8", className)}>
      <div>
        <h1 className="text-xl font-bold">
          {changeType === "immediate" ? t.upgrade : t.changePlan} to{" "}
          {tierLabel(targetTier)}
        </h1>
        <p className="text-muted mt-1 text-sm">
          {changeType === "immediate"
            ? t.enterCardDetails
            : isScheduled
              ? t.scheduledAtRenewal
              : t.changedImmediately}
        </p>
      </div>

      <PlanSummaryCard
        targetTier={targetTier}
        currency={currency}
        priceCents={priceCents}
      />

      {isCurrent && <p className="text-muted text-sm">{t.alreadyOnPlan}</p>}

      {changeType === "immediate" && (
        <StripeCardForm
          tier={targetTier}
          onSuccess={() => onUpgradeSuccess(setSuccess, router, refreshUser)}
          onError={setError}
        />
      )}

      {changeType !== "immediate" && (
        <DowngradeSection
          targetTier={targetTier}
          error={error}
          setError={setError}
          onSuccess={(effectiveAt) =>
            onChangeApplied(setScheduledEffectiveAt, setSuccess, effectiveAt)
          }
          confirmLabel={(isScheduled
            ? t.confirmChange
            : t.confirmDowngrade
          ).replace("{tier}", tierLabel(targetTier))}
          redirectDelayMs={isScheduled ? 5000 : 2000}
        />
      )}

      {changeType === "immediate" && error && (
        <p className="text-sm text-red-600" data-testid="checkout-error">
          {error}
        </p>
      )}
    </div>
  );
}
