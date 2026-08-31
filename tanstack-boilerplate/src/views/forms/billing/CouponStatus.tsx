import { calcPrice, resolveCouponPercent } from "./billing-utils";
import type { CouponStatusProps } from "@/types/forms/billing/CouponStatus-types";

export function CouponStatus({ code, plan, period, t }: CouponStatusProps) {
  if (!code) return null;
  const pct = resolveCouponPercent(code);
  if (!pct) return null;
  const { couponAmount } = calcPrice(plan, period, pct);
  return (
    <span className="text-success text-xxs">
      {t.couponApplied} — ${couponAmount} {t.couponOff}
    </span>
  );
}
