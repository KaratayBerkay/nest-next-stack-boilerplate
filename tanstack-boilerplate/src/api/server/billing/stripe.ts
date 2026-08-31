import { apiFetchJson } from "@/lib/api-client";
import {
  STRIPE_CREATE_SETUP_INTENT_URL,
  STRIPE_SUBSCRIBE_URL,
} from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

// `tier` is optional: the backend mutation this proxies
// (createBillingSetupIntent) takes no arguments at all — a SetupIntent isn't
// tied to any particular plan, it's just "save a card for this customer".
// The checkout flow still passes its target tier through for context/future
// use; a plain "add a card in Settings" flow (no tier involved) omits it.
export async function createSetupIntentServer(
  tier?: string,
): Promise<{ clientSecret: string }> {
  return apiFetchJson<{ clientSecret: string }>(
    STRIPE_CREATE_SETUP_INTENT_URL,
    {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ tier }),
    },
  );
}

export interface SubscribeResult {
  ok: boolean;
  periodEnd: string | null;
  pendingTier: string | null;
  pendingTierEffectiveAt: string | null;
}

export async function subscribeServer(
  tier: string,
  paymentMethodId?: string,
  idempotencyKey?: string,
  currentTier?: string,
  currency?: string,
): Promise<SubscribeResult> {
  return apiFetchJson<SubscribeResult>(STRIPE_SUBSCRIBE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({
      tier,
      paymentMethodId,
      idempotencyKey,
      currentTier,
      currency,
    }),
  });
}
