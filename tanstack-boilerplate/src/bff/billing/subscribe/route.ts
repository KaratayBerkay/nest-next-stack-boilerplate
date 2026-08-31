import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  SESSION_USER_COOKIE,
  sessionUserCookieOptions,
} from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";
import { publishEvent } from "@/lib/kafka";
import { tierLabel, TIER_ORDER, type Tier } from "@/lib/tier";
import { ME_QUERY } from "@/lib/graphql/queries";
import {
  decodeSessionUserCookie,
  encodeSessionUserCookie,
} from "@/lib/session-user-cookie";

const SUBSCRIBE_MUTATION = `
  mutation SubscribeToPlan(
    $tier: SubscriptionTier!
    $paymentMethodId: String
    $idempotencyKey: String
    $currency: String
  ) {
    subscribeToPlan(
      tier: $tier
      paymentMethodId: $paymentMethodId
      idempotencyKey: $idempotencyKey
      currency: $currency
    ) {
      success
      reason
      periodEnd
      pendingTier
      pendingTierEffectiveAt
    }
  }
`;

// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      {
        statusCode: 401,
        exc: "EX_AUTH_INVALID_CREDENTIALS",
        msg: "Unauthorized",
        key: "auth.errors.unauthorized",
      },
      { status: 401 },
    );
  }

  let body: {
    tier: string;
    paymentMethodId?: string;
    idempotencyKey?: string;
    currentTier?: string;
    currency?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Invalid JSON body",
        key: "errors.invalidJson",
      },
      { status: 400 },
    );
  }

  if (!body.tier) {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "tier is required",
        key: "errors.fieldsRequired",
      },
      { status: 400 },
    );
  }

  // Re-selecting the current tier is the pending-change escape hatch (T6):
  // the backend releases the schedule without charging, so no card is needed.
  const isUpgrade = ["BASIC", "MEDIUM", "PREMIUM"].includes(body.tier);
  const isReSelection = body.tier === body.currentTier;
  // A card is only actually required for a fresh FREE->paid subscription —
  // Stripe already has a payment method on file for any paid->paid change,
  // which is why the backend mutation itself never demands one for that
  // case. Defaulting to "from FREE" when the caller omits currentTier keeps
  // existing callers that always do supply a real card (StripeCardForm)
  // unaffected either way.
  const isFromFree = !body.currentTier || body.currentTier === "FREE";
  if (isUpgrade && !isReSelection && isFromFree && !body.paymentMethodId) {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Payment method required for upgrades",
        key: "billing.errors.cardRequired",
      },
      { status: 400 },
    );
  }

  const extraHeaders = await csrfEchoHeaders();
  const { data, errors } = await graphqlFetch<{
    subscribeToPlan: {
      success: boolean;
      reason?: string;
      periodEnd?: string;
      pendingTier?: string;
      pendingTierEffectiveAt?: string;
    };
  }>(
    SUBSCRIBE_MUTATION,
    {
      tier: body.tier,
      paymentMethodId: body.paymentMethodId ?? null,
      idempotencyKey: body.idempotencyKey ?? null,
      currency: body.currency ?? null,
    },
    accessToken,
    extraHeaders ?? undefined,
  );

  if (errors) {
    const errBody = graphqlErrorBody(errors, "Subscription failed");
    return NextResponse.json(errBody, { status: errBody.statusCode });
  }

  const result = data?.subscribeToPlan;
  if (!result?.success) {
    return NextResponse.json(
      {
        statusCode: 402,
        exc: "EX_BILLING_DECLINED",
        msg: result?.reason ?? "Payment declined",
        key: "billing.errors.declined",
      },
      { status: 402 },
    );
  }

  const meData = await graphqlFetch<{
    me: Record<string, unknown> & { id: string; email: string; name?: string };
  }>(ME_QUERY, {}, accessToken);
  const user = meData?.data?.me;

  // Only a genuine move to a higher tier is an "upgraded" event — this used
  // to fire unconditionally, including for downgrades and cancellations,
  // which would mislead any future consumer (e.g. a "Welcome to Premium"
  // email triggered by a downgrade).
  const isRealUpgrade =
    !isReSelection &&
    (TIER_ORDER[body.tier as Tier] ?? 0) >
      (TIER_ORDER[body.currentTier as Tier] ?? 0);
  if (isRealUpgrade) {
    await publishEvent("billing.subscription.upgraded", {
      userId: user?.id ?? "unknown",
      email: user?.email ?? "unknown",
      name: user?.name ?? "User",
      tier: body.tier,
      label: tierLabel(body.tier),
      timestamp: new Date().toISOString(),
      event: "subscription.upgraded",
    });
  }

  const response = NextResponse.json({
    ok: true,
    periodEnd: result.periodEnd ?? null,
    pendingTier: result.pendingTier ?? null,
    pendingTierEffectiveAt: result.pendingTierEffectiveAt ?? null,
  });

  // session_user is a denormalized snapshot (see /api/auth/me's fast path
  // and getSessionUser()) that's otherwise only written at login/register.
  // A tier change is real and immediate here for FREE<->paid; for a
  // paid<->paid schedule the tier hasn't actually moved yet either, so
  // re-syncing from this fresh `me` read is correct either way — no need
  // to special-case immediate vs. deferred. Without this, the account's own
  // Pricing/Billing pages keep showing the pre-upgrade tier until the next
  // full login, even though the charge succeeded and Postgres/Redis are
  // already correct (same bug class as the profile-update cookie fix
  // above it, just for tier instead of chatNickname/name/etc).
  if (user) {
    const encoded = cookieStore.get(SESSION_USER_COOKIE)?.value;
    const current =
      (encoded && decodeSessionUserCookie<Record<string, unknown>>(encoded)) ||
      {};
    const merged = { ...current, ...user };
    response.cookies.set(
      sessionUserCookieOptions(encodeSessionUserCookie(merged)),
    );
  }

  return response;
}
