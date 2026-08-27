"use client";

import { cn } from "@/lib/cn";
import type { CheckoutSuccessViewProps } from "@/types/checkout/CheckoutSuccessView-types";

export function CheckoutSuccessView({
  isDowngrade,
  downgradeMsg,
  upgradeMsg,
  redirectingMsg,
  message,
  className,
}: CheckoutSuccessViewProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center gap-6 py-20",
        className,
      )}
    >
      <p className="text-success text-lg font-medium">
        {message ?? (isDowngrade ? downgradeMsg : upgradeMsg)}
      </p>
      <p className="text-muted text-sm">{redirectingMsg}</p>
    </div>
  );
}
