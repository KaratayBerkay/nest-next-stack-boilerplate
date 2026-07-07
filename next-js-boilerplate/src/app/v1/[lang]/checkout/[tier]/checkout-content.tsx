"use client";

import { use, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { StripeCardForm } from "@/features/billing/ui/StripeCardForm";
import { TIER_ORDER, tierLabel, TIER_PRICES_CENTS, type Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { PRICING_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useState } from "react";

const TIER_FEATURES: Record<string, string[]> = {
  BASIC: ["Access to basic features", "Standard support"],
  MEDIUM: [
    "Everything in Basic",
    "Post stats & reaction breakdown",
    "VIP room access",
    "Suggested friends",
  ],
  PREMIUM: [
    "Everything in Medium",
    "Who-reacted list",
    "Export data",
    "Crown badge",
    "Priority support",
  ],
};

// fallow-ignore-next-line complexity
export default function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: string; tier: string }>;
}) {
  const { lang, tier: targetTier } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useMessages("checkout");
  const currency = useCurrencyCookie();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInToUpgrade} />;

  const currentRank = TIER_ORDER[user.tier as Tier] ?? 0;
  const targetRank = TIER_ORDER[targetTier as Tier] ?? 0;
  const isUpgrade = targetRank > currentRank;
  const isDowngrade = targetRank < currentRank;
  const isCurrent = targetRank === currentRank;

  // fallow-ignore-next-line complexity
  const handleDowngrade = async () => {
    setError(null);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: targetTier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg ?? "Failed to change plan");
      setSuccess(true);
      setTimeout(() => router.push(PRICING_PATH), 2000);
    } catch (err) {
      setError((err as Error).message ?? "Failed to change plan");
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg font-medium text-green-600">
          {isDowngrade ? t.planChanged : t.upgradeSuccess}
        </p>
        <p className="text-sm text-muted">{t.redirecting}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div>
        <h1 className="text-xl font-bold">
          {isUpgrade ? t.upgrade : isDowngrade ? t.changePlan : t.checkout} to{" "}
          {tierLabel(targetTier)}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isUpgrade
            ? t.enterCardDetails
            : isDowngrade
              ? t.changedImmediately
              : t.alreadyOnPlan}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="font-medium">{tierLabel(targetTier)}</h2>
        <p className="mt-1 text-2xl font-bold">
          {formatPrice(TIER_PRICES_CENTS[targetTier as Tier] ?? 0, currency)}
        </p>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {(TIER_FEATURES[targetTier] ?? []).map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
      </div>

      {isCurrent && (
        <p className="text-sm text-muted">
          {t.alreadyOnPlan}
        </p>
      )}

      {isUpgrade && (
        <StripeCardForm
          tier={targetTier}
          onSuccess={() => {
            setSuccess(true);
            setTimeout(() => router.push(PRICING_PATH), 2000);
          }}
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
            onClick={handleDowngrade}
            data-testid="confirm-downgrade"
            className="w-full rounded bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
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
