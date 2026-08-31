export interface BillingSummaryProps {
  price: {
    subtotal: number;
    discountPercent: number | null;
    couponAmount: number;
    total: number;
  };
  t: Record<string, string>;
}
