"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBillingActions } from "@/api/client/billing/actions";
import type { SubscribeResult } from "@/api/server/billing/stripe";
import type { DowngradeSectionProps } from "@/types/checkout/DowngradeSection-types";
import { PRICING_PATH } from "@/constants/routes";

async function handleDowngrade(
  targetTier: string,
  currentTier: string | undefined,
  setError: Dispatch<SetStateAction<string | null>>,
  onSuccess: (effectiveAt: string | null) => void,
  router: ReturnType<typeof useRouter>,
  subscribe: (
    tier: string,
    paymentMethodId?: string,
    idempotencyKey?: string,
    currentTier?: string,
  ) => Promise<SubscribeResult>,
  refreshUser: () => Promise<void>,
  redirectDelayMs: number,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  retryKeyRef: React.MutableRefObject<string | null>,
) {
  setError(null);
  setSubmitting(true);
  try {
    // One idempotency key per plan-change attempt, reused across a
    // failure-then-retry (same reasoning as StripeCardForm's retryKeyRef) —
    // previously this was a bare `undefined` on every call, so a double-
    // click (nothing here disabled the button while a request was in
    // flight) fired two concurrent, un-deduped subscribe mutations.
    const retryKey =
      retryKeyRef.current ?? (retryKeyRef.current = crypto.randomUUID());
    // currentTier tells the BFF this isn't a fresh FREE→paid subscription, so
    // it doesn't demand a paymentMethodId the user was never asked for here
    // (see app/api/billing/subscribe/route.ts's isUpgrade check).
    const result = await subscribe(
      targetTier,
      undefined,
      retryKey,
      currentTier,
    );
    retryKeyRef.current = null;
    await refreshUser();
    onSuccess(result.pendingTierEffectiveAt ?? null);
    setTimeout(() => router.push(PRICING_PATH), redirectDelayMs);
  } catch (err) {
    setError((err as Error).message ?? "Failed to change plan");
  } finally {
    setSubmitting(false);
  }
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
  const { user, refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const retryKeyRef = useRef<string | null>(null);

  useEffect(() => {
    retryKeyRef.current = crypto.randomUUID();
  }, [targetTier]);

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-error text-sm" data-testid="checkout-error">
          {error}
        </p>
      )}
      <button
        onClick={() =>
          handleDowngrade(
            targetTier,
            user?.tier,
            setError,
            onSuccess,
            router,
            subscribe,
            refreshUser,
            redirectDelayMs,
            setSubmitting,
            retryKeyRef,
          )
        }
        disabled={submitting}
        data-testid="confirm-downgrade"
        className="bg-muted hover:bg-muted/80 w-full rounded px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {confirmLabel}
      </button>
    </div>
  );
}
