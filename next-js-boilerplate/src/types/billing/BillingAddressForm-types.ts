import type { BillingAddress } from "@/api/server/billing/address";

export interface BillingAddressFormProps {
  address: BillingAddress | null;
  onSave: (data: Partial<BillingAddress>) => void;
  onCancel: () => void;
  isSaving?: boolean;
  className?: string;
}
