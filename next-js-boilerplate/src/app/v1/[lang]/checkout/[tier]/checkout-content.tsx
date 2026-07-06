"use client";

import { use, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { MockCardForm } from "@/features/billing/ui/mock-card-form";
import { apiFetchJson } from "@/lib/api-client";
import { TIER_ORDER, tierLabel, type Tier } from "@/lib/tier";
import { PRICING_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useState } from "react";

import { TIER_PRICES } from "@/lib/tier";

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

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: string; tier: string }>;
}) {
  const { lang, tier: targetTier } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useMessages("checkout");
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

  const handleDowngrade = async () => {
    setError(null);
    try {
      await apiFetchJson("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: targetTier }),
      });
      setSuccess(true);
      setTimeout(() => router.push(PRICING_PATH), 2000);
    } catch (err) {
      setError((err as { msg?: string }).msg ?? "Failed to change plan");
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
          {TIER_PRICES[targetTier] ?? "Free"}
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
        <MockCardForm
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
    </div>
  );
}
