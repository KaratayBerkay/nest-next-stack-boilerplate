import { VALID_COUPONS } from "./billing-constants";
import { calcPrice } from "./billing-utils";
import type { CouponStatusProps } from "@/types/forms/billing/CouponStatus-types";

export function CouponStatus({ code, plan, period, t }: CouponStatusProps) {
  if (!code) return null;
  const upper = code.toUpperCase();
  const coupon = VALID_COUPONS[upper];
  if (!coupon) return null;
  const price = calcPrice(plan, period);
  const discount = Math.round(price.subtotal * (coupon.pct / 100));
  return (
    <span className="text-success text-xxs">
      {t.couponApplied} — ${discount} {t.couponOff}
    </span>
  );
}
