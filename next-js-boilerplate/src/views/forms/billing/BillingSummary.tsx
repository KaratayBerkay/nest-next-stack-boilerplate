import type { BillingSummaryProps } from "@/types/forms/billing/BillingSummary-types";

export function BillingSummary({ price, t }: BillingSummaryProps) {
  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex justify-between">
        <span>{t.subtotal}</span>
        <span>${price.subtotal}</span>
      </div>
      {price.discountPercent !== null && (
        <div className="text-success flex justify-between">
          <span>{t.discount}</span>
          <span>
            -{price.discountPercent}% {t.couponOff}
          </span>
        </div>
      )}
      {price.couponAmount > 0 && (
        <div className="text-success flex justify-between">
          <span>{t.couponDiscount}</span>
          <span>-${price.couponAmount}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold">
        <span>{t.total}</span>
        <span>${price.total}</span>
      </div>
    </div>
  );
}
