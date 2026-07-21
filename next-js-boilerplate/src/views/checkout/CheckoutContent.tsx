"use client";

import { use } from "react";
import type { CheckoutPageProps } from "@/types/checkout/CheckoutPage-types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const StripeCardForm = dynamic(
  () =>
    import("@/features/billing/ui/StripeCardForm").then(
      (mod) => mod.StripeCardForm,
    ),
  { ssr: false },
);
import {
  TIER_ORDER,
  tierLabel,
  TIER_PRICES_CENTS,
  type Tier,
} from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { PRICING_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useBillingActions } from "@/api/client/billing/actions";
import { cn } from "@/lib/cn";

import { TIER_FEATURES } from "@/lib/checkout/tier-features";

async function handleDowngrade(
  targetTier: string,
  setError: Dispatch<SetStateAction<string | null>>,
  setSuccess: Dispatch<SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
  subscribe: (tier: string, paymentMethodId?: string) => Promise<void>,
) {
  setError(null);
  try {
    await subscribe(targetTier);
    setSuccess(true);
    setTimeout(() => router.push(PRICING_PATH), 2000);
  } catch (err) {
    setError((err as Error).message ?? "Failed to change plan");
  }
}

function onUpgradeSuccess(
  setSuccess: Dispatch<SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
) {
  setSuccess(true);
  setTimeout(() => router.push(PRICING_PATH), 2000);
}

export default function CheckoutPage({ params, className }: CheckoutPageProps) {
  const { lang: _lang, tier: targetTier } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const t = useMessages("checkout");
  const currency = useCurrencyCookie();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { subscribe } = useBillingActions();

  const currentRank = TIER_ORDER[user!.tier as Tier] ?? 0;
  const targetRank = TIER_ORDER[targetTier as Tier] ?? 0;
  const isUpgrade = targetRank > currentRank;
  const isDowngrade = targetRank < currentRank;
  const isCurrent = targetRank === currentRank;

  if (success) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center gap-6 py-20",
          className,
        )}
      >
        <p className="text-lg font-medium text-green-600">
          {isDowngrade ? t.planChanged : t.upgradeSuccess}
        </p>
        <p className="text-muted text-sm">{t.redirecting}</p>
      </div>
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

      <div className="border-border bg-surface rounded-lg border p-4">
        <h2 className="font-medium">{tierLabel(targetTier)}</h2>
        <p className="mt-1 text-2xl font-bold">
          {formatPrice(TIER_PRICES_CENTS[targetTier as Tier] ?? 0, currency)}
        </p>
        <ul className="text-muted mt-3 space-y-1 text-sm">
          {(TIER_FEATURES[targetTier] ?? []).map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
      </div>

      {isCurrent && <p className="text-muted text-sm">{t.alreadyOnPlan}</p>}

      {isUpgrade && (
        <StripeCardForm
          tier={targetTier}
          onSuccess={() => onUpgradeSuccess(setSuccess, router)}
          onError={setError}
        />
      )}

      {isDowngrade && (
        <div className="space-y-3">
          {error && (
            <p className="text-sm text-red-600" data-testid="checkout-error">
              {error}
            </p>
          )}
          <button
            onClick={() =>
              handleDowngrade(
                targetTier,
                setError,
                setSuccess,
                router,
                subscribe,
              )
            }
            data-testid="confirm-downgrade"
            className="bg-muted hover:bg-muted/80 w-full rounded px-4 py-2 text-sm font-medium"
          >
            {t.confirmDowngrade.replace("{tier}", tierLabel(targetTier))}
          </button>
        </div>
      )}

      {isUpgrade && error && (
        <p className="text-sm text-red-600" data-testid="checkout-error">
          {error}
        </p>
      )}
    </div>
  );
}
