import { apiFetchJson, apiFetch } from "@/lib/api-client";
import { BILLING_PAYMENT_METHODS_URL } from "@/constants/api/urls";

export interface PaymentMethodInfo {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export async function fetchPaymentMethodsServer(): Promise<
  PaymentMethodInfo[]
> {
  const data = await apiFetchJson<{ paymentMethods: PaymentMethodInfo[] }>(
    BILLING_PAYMENT_METHODS_URL,
  );
  return data.paymentMethods;
}

export async function setDefaultPaymentMethodServer(
  paymentMethodId: string,
): Promise<void> {
  await apiFetch(BILLING_PAYMENT_METHODS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "setDefault", paymentMethodId }),
  });
}

export async function removePaymentMethodServer(
  paymentMethodId: string,
): Promise<void> {
  await apiFetch(BILLING_PAYMENT_METHODS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "remove", paymentMethodId }),
  });
}
