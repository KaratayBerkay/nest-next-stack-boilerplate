"use client";

import { type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBillingActions } from "@/api/client/billing/actions";
import type { SubscribeResult } from "@/api/server/billing/stripe";
import { PRICING_PATH } from "@/constants/routes";

async function handleDowngrade(
  targetTier: string,
  setError: Dispatch<SetStateAction<string | null>>,
  onSuccess: (effectiveAt: string | null) => void,
  router: ReturnType<typeof useRouter>,
  subscribe: (
    tier: string,
    paymentMethodId?: string,
  ) => Promise<SubscribeResult>,
  refreshUser: () => Promise<void>,
  redirectDelayMs: number,
) {
  setError(null);
  try {
    const result = await subscribe(targetTier);
    await refreshUser();
    onSuccess(result.pendingTierEffectiveAt ?? null);
    setTimeout(() => router.push(PRICING_PATH), redirectDelayMs);
  } catch (err) {
    setError((err as Error).message ?? "Failed to change plan");
  }
}

interface DowngradeSectionProps {
  targetTier: string;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  onSuccess: (effectiveAt: string | null) => void;
  confirmLabel: string;
  redirectDelayMs: number;
}

export function DowngradeSection({
  targetTier,
  error,
  setError,
  onSuccess,
  confirmLabel,
  redirectDelayMs,
}: DowngradeSectionProps) {
  const router = useRouter();
  const { subscribe } = useBillingActions();
  const { refreshUser } = useAuth();

  return (
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
            onSuccess,
            router,
            subscribe,
            refreshUser,
            redirectDelayMs,
          )
        }
        data-testid="confirm-downgrade"
        className="bg-muted hover:bg-muted/80 w-full rounded px-4 py-2 text-sm font-medium"
      >
        {confirmLabel}
      </button>
    </div>
  );
}
