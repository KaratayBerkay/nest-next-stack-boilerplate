import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  SESSION_USER_COOKIE,
  sessionUserCookieOptions,
} from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";
import { ME_QUERY } from "@/lib/graphql/queries";
import {
  decodeSessionUserCookie,
  encodeSessionUserCookie,
} from "@/lib/session-user-cookie";
import { DECLINE_REASON_KEYS } from "../route";

// BE-019: second half of a first subscription whose card needed 3DS. The
// page confirmed the PaymentIntent with Stripe.js; the backend re-reads the
// subscription and provisions the tier once Stripe reports it active.
const FINALIZE_MUTATION = `
  mutation FinalizeSubscription($stripeSubscriptionId: String!) {
    finalizeSubscription(stripeSubscriptionId: $stripeSubscriptionId) {
      success
      reason
      periodEnd
      clientSecret
      stripeSubscriptionId
    }
  }
`;

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

  let body: { stripeSubscriptionId?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  if (
    typeof body.stripeSubscriptionId !== "string" ||
    !body.stripeSubscriptionId
  ) {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "stripeSubscriptionId is required",
        key: "errors.fieldsRequired",
      },
      { status: 400 },
    );
  }

  const extraHeaders = await csrfEchoHeaders();
  const { data, errors } = await graphqlFetch<{
    finalizeSubscription: {
      success: boolean;
      reason?: string;
      periodEnd?: string;
      clientSecret?: string | null;
      stripeSubscriptionId?: string | null;
    };
  }>(
    FINALIZE_MUTATION,
    { stripeSubscriptionId: body.stripeSubscriptionId },
    accessToken,
    extraHeaders ?? undefined,
  );

  if (errors) {
    const errBody = graphqlErrorBody(errors, "Subscription failed");
    return NextResponse.json(errBody, { status: errBody.statusCode });
  }

  const result = data?.finalizeSubscription;
  if (
    !result?.success &&
    result?.reason === "authentication_required" &&
    result.clientSecret
  ) {
    return NextResponse.json({
      ok: false,
      requiresAction: true,
      clientSecret: result.clientSecret,
      stripeSubscriptionId: body.stripeSubscriptionId,
    });
  }
  if (!result?.success) {
    const reason = result?.reason ?? "declined";
    return NextResponse.json(
      {
        statusCode: 402,
        exc: "EX_BILLING_DECLINED",
        msg: "Payment declined",
        key: DECLINE_REASON_KEYS[reason] ?? "billing.errors.declined",
        reason,
      },
      { status: 402 },
    );
  }

  const meData = await graphqlFetch<{
    me: Record<string, unknown> & { id: string; email: string; name?: string };
  }>(ME_QUERY, {}, accessToken);
  const user = meData?.data?.me;

  const response = NextResponse.json({
    ok: true,
    periodEnd: result.periodEnd ?? null,
    pendingTier: null,
    pendingTierEffectiveAt: null,
  });
  // Same session_user re-sync as /api/billing/subscribe — the tier just
  // moved for real.
  if (user) {
    const encoded = cookieStore.get(SESSION_USER_COOKIE)?.value;
    const current =
      (encoded && decodeSessionUserCookie<Record<string, unknown>>(encoded)) ||
      {};
    response.cookies.set(
      sessionUserCookieOptions(
        encodeSessionUserCookie({ ...current, ...user }),
      ),
    );
  }
  return response;
}
