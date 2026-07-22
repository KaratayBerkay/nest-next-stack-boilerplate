import type { Transaction } from "@/types/billing/FreePageView-types";

export interface InvoiceTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  className?: string;
}

export interface InvoiceRowProps {
  transaction: Transaction;
  index: number;
}
