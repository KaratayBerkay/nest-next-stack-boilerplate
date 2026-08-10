"use client";

import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
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
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onCancelPendingChange}
        >
          {cancelPendingChangeLabel}
        </Button>
      ) : tier === "FREE" ? (
        <Button asChild>
          <Link href={plansPath()}>{upgradePlanLabel}</Link>
        </Button>
      ) : (
        <>
          <Button asChild>
            <Link href={plansPath()}>{upgradePlanLabel}</Link>
          </Button>
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
                <Button type="button" variant="outline" onClick={open}>
                  {cancelSubscriptionLabel}
                </Button>
              )}
            </ConfirmDialog>
          )}
        </>
      )}
    </div>
  );
}
