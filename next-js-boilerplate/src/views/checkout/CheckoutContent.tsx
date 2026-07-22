"use client";

import { use, useState, type Dispatch, type SetStateAction } from "react";
import type { CheckoutPageProps } from "@/types/checkout/CheckoutPage-types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { TIER_ORDER, tierLabel, type Tier } from "@/lib/tier";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { PRICING_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cn } from "@/lib/cn";
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

export default function CheckoutPage({ params, className }: CheckoutPageProps) {
  const { lang: _lang, tier: targetTier } = use(params);
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const t = useMessages("checkout");
  const currency = useCurrencyCookie();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentRank = TIER_ORDER[user!.tier as Tier] ?? 0;
  const targetRank = TIER_ORDER[targetTier as Tier] ?? 0;
  const isUpgrade = targetRank > currentRank;
  const isDowngrade = targetRank < currentRank;
  const isCurrent = targetRank === currentRank;

  if (success) {
    return (
      <CheckoutSuccessView
        isDowngrade={isDowngrade}
        downgradeMsg={t.planChanged}
        upgradeMsg={t.upgradeSuccess}
        redirectingMsg={t.redirecting}
        className={className}
      />
    );
  }

  return (
    <div className={cn("flex h-full w-full flex-col gap-6 py-8", className)}>
      <div>
        <h1 className="text-xl font-bold">
          {isUpgrade ? t.upgrade : isDowngrade ? t.changePlan : t.checkout} to{" "}
          {tierLabel(targetTier)}
        </h1>
        <p className="text-muted mt-1 text-sm">
          {isUpgrade
            ? t.enterCardDetails
            : isDowngrade
              ? t.changedImmediately
              : t.alreadyOnPlan}
        </p>
      </div>

      <PlanSummaryCard targetTier={targetTier} currency={currency} />

      {isCurrent && <p className="text-muted text-sm">{t.alreadyOnPlan}</p>}

      {isUpgrade && (
        <StripeCardForm
          tier={targetTier}
          onSuccess={() => onUpgradeSuccess(setSuccess, router, refreshUser)}
          onError={setError}
        />
      )}

      {isDowngrade && (
        <DowngradeSection
          targetTier={targetTier}
          error={error}
          setError={setError}
          setSuccess={setSuccess}
          confirmLabel={t.confirmDowngrade.replace("{tier}", tierLabel(targetTier))}
        />
      )}

      {isUpgrade && error && (
        <p className="text-sm text-red-600" data-testid="checkout-error">
          {error}
        </p>
      )}
    </div>
  );
}
