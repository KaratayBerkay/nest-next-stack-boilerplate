import type { Transaction } from "@/views/settings/billing/FreePageView";

export interface InvoiceTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  className?: string;
}

export interface InvoiceRowProps {
  transaction: Transaction;
  index: number;
}
