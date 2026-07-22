import type { PaymentMethodInfo } from "@/api/server/billing/payment-methods";

export interface PaymentMethodsProps {
  className?: string;
}

export interface PaymentMethodCardProps {
  method: PaymentMethodInfo;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
  isSettingDefault?: boolean;
  isRemoving?: boolean;
}
