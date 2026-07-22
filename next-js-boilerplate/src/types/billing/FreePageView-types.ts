export interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  reference: string;
  stripeInvoiceUrl?: string;
  createdAt: string;
}

export interface SubscriptionInfo {
  tier: string;
  priceCents: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  cancelAtPeriodEnd: boolean;
}
