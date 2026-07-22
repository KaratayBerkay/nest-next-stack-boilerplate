"use client";

import { type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useBillingActions } from "@/api/client/billing/actions";
import { PRICING_PATH } from "@/constants/routes";

async function handleDowngrade(
  targetTier: string,
  setError: Dispatch<SetStateAction<string | null>>,
  setSuccess: Dispatch<SetStateAction<boolean>>,
  router: ReturnType<typeof useRouter>,
  subscribe: (tier: string, paymentMethodId?: string) => Promise<void>,
  refreshUser: () => Promise<void>,
) {
  setError(null);
  try {
    await subscribe(targetTier);
    await refreshUser();
    setSuccess(true);
    setTimeout(() => router.push(PRICING_PATH), 2000);
  } catch (err) {
    setError((err as Error).message ?? "Failed to change plan");
  }
}

interface DowngradeSectionProps {
  targetTier: string;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  setSuccess: Dispatch<SetStateAction<boolean>>;
  confirmLabel: string;
}

export function DowngradeSection({
  targetTier,
  error,
  setError,
  setSuccess,
  confirmLabel,
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
            setSuccess,
            router,
            subscribe,
            refreshUser,
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
