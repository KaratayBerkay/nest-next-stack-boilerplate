import { apiFetchJson } from "@/lib/api-client";
import { STRIPE_CREATE_SETUP_INTENT_URL, STRIPE_SUBSCRIBE_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function createSetupIntentServer(tier: string): Promise<{ clientSecret: string }> {
  return apiFetchJson<{ clientSecret: string }>(STRIPE_CREATE_SETUP_INTENT_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ tier }),
  });
}

export async function subscribeServer(tier: string, paymentMethodId?: string): Promise<void> {
  await apiFetchJson(STRIPE_SUBSCRIBE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ tier, paymentMethodId }),
  });
}
