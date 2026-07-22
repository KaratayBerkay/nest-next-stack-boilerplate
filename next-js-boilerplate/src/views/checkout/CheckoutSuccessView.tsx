"use client";

import { cn } from "@/lib/cn";

interface CheckoutSuccessViewProps {
  isDowngrade: boolean;
  downgradeMsg: string;
  upgradeMsg: string;
  redirectingMsg: string;
  className?: string;
}

export function CheckoutSuccessView({
  isDowngrade,
  downgradeMsg,
  upgradeMsg,
  redirectingMsg,
  className,
}: CheckoutSuccessViewProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center gap-6 py-20",
        className,
      )}
    >
      <p className="text-lg font-medium text-green-600">
        {isDowngrade ? downgradeMsg : upgradeMsg}
      </p>
      <p className="text-muted text-sm">{redirectingMsg}</p>
    </div>
  );
}
