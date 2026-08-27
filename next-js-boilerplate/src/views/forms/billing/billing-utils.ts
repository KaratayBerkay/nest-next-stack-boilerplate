import { PLANS, VALID_COUPONS } from "./billing-constants";

export function resolveCouponPercent(code: string): number {
  return VALID_COUPONS[code.toUpperCase()]?.pct ?? 0;
}

export function calcPrice(
  plan: string,
  period: string,
  couponPct = 0,
): {
  subtotal: number;
  discountPercent: number | null;
  couponAmount: number;
  total: number;
} {
  const p = PLANS.find((x) => x.value === plan) ?? PLANS[0];
  const subtotal = period === "yearly" ? p.yearly : p.monthly;
  const discountPercent = period === "yearly" && p.monthly > 0 ? 20 : null;
  // Previously computed and displayed (see CouponStatus) but never actually
  // deducted anywhere — the summary's Total stayed equal to the subtotal
  // even with a valid coupon applied.
  const couponAmount = Math.round(subtotal * (couponPct / 100));
  return {
    subtotal,
    discountPercent,
    couponAmount,
    total: subtotal - couponAmount,
  };
}

export function validateTaxId(
  value: string,
  invalidMsg: string,
): string | undefined {
  if (!value) return undefined;
  return /^[A-Z]{2}[A-Z0-9]{2,13}$/.test(value) ? undefined : invalidMsg;
}
