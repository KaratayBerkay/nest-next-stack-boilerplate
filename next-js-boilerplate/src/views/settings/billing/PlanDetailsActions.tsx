"use client";

import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { plansPath } from "@/constants/routes";
import type { PlanDetailsActionsProps } from "@/types/views/settings/PlanDetails-types";

export function PlanDetailsActions({
  hasPendingChange,
  tier,
  cancelAtPeriodEnd,
  onCancel,
  onCancelPendingChange,
  upgradePlanLabel,
  cancelPendingChangeLabel,
  cancelSubscriptionLabel,
  cancelSubscriptionConfirmLabel,
  cancelsOnLabel,
}: PlanDetailsActionsProps) {
  return (
    <div className="mt-4 flex items-center gap-2">
      {hasPendingChange ? (
        <button
          type="button"
          onClick={onCancelPendingChange}
          className="border-border hover:bg-surface-hover w-full rounded-lg border px-4 py-2 text-sm font-medium"
        >
          {cancelPendingChangeLabel}
        </button>
      ) : tier === "FREE" ? (
        <Link
          href={plansPath()}
          className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          {upgradePlanLabel}
        </Link>
      ) : (
        <>
          <Link
            href={plansPath()}
            className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            {upgradePlanLabel}
          </Link>
          {cancelAtPeriodEnd ? (
            <p className="text-warning text-xs">{cancelsOnLabel}</p>
          ) : (
            <ConfirmDialog
              title={cancelSubscriptionLabel}
              description={cancelSubscriptionConfirmLabel}
              confirmLabel={cancelSubscriptionLabel}
              onConfirm={onCancel}
            >
              {(open) => (
                <button
                  type="button"
                  onClick={open}
                  className="border-border hover:bg-surface-hover rounded-lg border px-4 py-2 text-sm font-medium"
                >
                  {cancelSubscriptionLabel}
                </button>
              )}
            </ConfirmDialog>
          )}
        </>
      )}
    </div>
  );
}
