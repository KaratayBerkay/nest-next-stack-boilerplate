import type { BillingAddress } from "@/api/server/billing/address";

export interface BillingInfoDisplayProps {
  address: BillingAddress | null;
  onEdit: () => void;
}
