import { apiFetchJson } from "@/lib/api-client";
import { BILLING_CANCEL_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function cancelSubscriptionServer(): Promise<void> {
  await apiFetchJson(BILLING_CANCEL_URL, { method: POST });
}
