export interface BillingSummaryProps {
  price: { subtotal: number; discountPercent: number | null; total: number };
  t: Record<string, string>;
}
