"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { TIER_PRICES_CENTS, tierLabel, type Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { plansPath } from "@/constants/routes";
import { useToast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";

interface PlanDetailsProps {
  tier: Tier;
  periodEnd?: string;
  cancelAtPeriodEnd: boolean;
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
    const { cancelSubscriptionServer } = await import("@/api/server/billing/cancel");
    await cancelSubscriptionServer();
    toast({ title: tSuccess });
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
  } catch {
    toast({ title: tFailed, variant: "destructive" });
  }
}

export function PlanDetails({ tier, periodEnd, cancelAtPeriodEnd }: PlanDetailsProps) {
  const t = useMessages("settings") as unknown as Record<string, string>;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const onCancel = useCallback(
    () => {
      handleCancel(
        "",
        queryClient,
        toast,
        t.cancelSubscriptionConfirm,
        t.cancelSubscriptionSuccess,
        t.cancelSubscriptionFailed,
      );
    },
    [queryClient, toast, t],
  );

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
      </ul>

      <div className="mt-4 flex items-center gap-2">
        {tier === "FREE" ? (
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
