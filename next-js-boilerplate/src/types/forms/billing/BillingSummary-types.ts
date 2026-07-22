export interface BillingSummaryProps {
  price: { subtotal: number; discountLabel: string | null; total: number };
  t: Record<string, string>;
}
