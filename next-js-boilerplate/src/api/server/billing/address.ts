import { apiFetchJson } from "@/lib/api-client";
import { BILLING_ADDRESS_URL } from "@/constants/api/urls";

export interface BillingAddress {
  name: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  vatNumber: string | null;
}

export async function fetchBillingAddressServer(): Promise<BillingAddress | null> {
  const data = await apiFetchJson<{ address: BillingAddress | null }>(
    BILLING_ADDRESS_URL,
  );
  return data.address;
}

export async function upsertBillingAddressServer(
  input: Partial<BillingAddress>,
): Promise<BillingAddress> {
  const data = await apiFetchJson<{ address: BillingAddress }>(
    BILLING_ADDRESS_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    },
  );
  return data.address;
}
