import type { SubscribeResult } from "@/api/server/billing/stripe";

/**
 * BE-019: drive a first subscription through Stripe's 3DS/SCA step when the
 * backend answers `requiresAction`. Pure orchestration so it can be tested
 * without Stripe Elements: `confirm` is Stripe.js' confirmCardPayment
 * (resolves to an error message or null), `finalize` is the BFF finalize
 * call. Loops at most a couple of times in case Stripe asks again.
 */
export async function completeSubscribeWithAuthentication(
  initial: SubscribeResult,
  deps: {
    confirm: (clientSecret: string) => Promise<string | null>;
    finalize: (stripeSubscriptionId: string) => Promise<SubscribeResult>;
    authenticationFailedMessage: string;
  },
  maxRounds = 2,
): Promise<SubscribeResult> {
  let result = initial;
  for (let round = 0; round < maxRounds; round++) {
    if (!result.requiresAction) return result;
    if (!result.clientSecret || !result.stripeSubscriptionId) {
      throw new Error(deps.authenticationFailedMessage);
    }
    const confirmError = await deps.confirm(result.clientSecret);
    if (confirmError) throw new Error(confirmError);
    result = await deps.finalize(result.stripeSubscriptionId);
  }
  if (result.requiresAction) throw new Error(deps.authenticationFailedMessage);
  return result;
}

/** Map a BFF decline `key`/`reason` to the checkout copy, falling back to the generic message. */
export function declineMessage(
  err: unknown,
  t: {
    declinedInsufficientFunds: string;
    declinedCard: string;
    authenticationRequired: string;
    subscriptionFailed: string;
  },
): string {
  const exception = (err as { exception?: { key?: string; reason?: string } })
    ?.exception;
  const reason =
    exception?.reason ??
    (exception?.key?.startsWith("billing.errors.")
      ? exception.key.slice("billing.errors.".length)
      : undefined);
  switch (reason) {
    case "insufficient_funds":
    case "insufficientFunds":
      return t.declinedInsufficientFunds;
    case "declined":
      return t.declinedCard;
    case "authentication_required":
    case "authenticationRequired":
      return t.authenticationRequired;
    default:
      return (err as Error)?.message || t.subscriptionFailed;
  }
}
