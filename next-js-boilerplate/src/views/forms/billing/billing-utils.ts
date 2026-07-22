import { PLANS } from "./billing-constants";

export function calcPrice(
  plan: string,
  period: string,
): { subtotal: number; discountLabel: string | null; total: number } {
  const p = PLANS.find((x) => x.value === plan) ?? PLANS[0];
  const subtotal = period === "yearly" ? p.yearly : p.monthly;
  const discountLabel = period === "yearly" && p.monthly > 0 ? "20% off" : null;
  return { subtotal, discountLabel, total: subtotal };
}

export function validateTaxId(
  value: string,
  invalidMsg: string,
): string | undefined {
  if (!value) return undefined;
  return /^[A-Z]{2}[A-Z0-9]{2,13}$/.test(value) ? undefined : invalidMsg;
}
