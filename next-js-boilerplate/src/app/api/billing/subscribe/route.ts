import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";
import { publishEvent } from "@/lib/kafka";
import { tierLabel } from "@/lib/tier";

const ME_QUERY = `
  query Me {
    me {
      id
      email
      name
    }
  }
`;

const SUBSCRIBE_MUTATION = `
  mutation SubscribeToPlan(
    $tier: SubscriptionTier!
    $last4: String
    $expMonth: Float
    $expYear: Float
  ) {
    subscribeToPlan(
      tier: $tier
      last4: $last4
      expMonth: $expMonth
      expYear: $expYear
    ) {
      success
      reason
    }
  }
`;

export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      { statusCode: 401, exc: "EX_AUTH_INVALID_CREDENTIALS", msg: "Unauthorized", key: "auth.errors.unauthorized" },
      { status: 401 },
    );
  }

  let body: { tier: string; last4?: string; expMonth?: number; expYear?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Invalid JSON body", key: "errors.invalidJson" },
      { status: 400 },
    );
  }

  if (!body.tier) {
    return NextResponse.json(
      { statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "tier is required", key: "errors.fieldsRequired" },
      { status: 400 },
    );
  }

  const isUpgrade = ["BASIC", "MEDIUM", "PREMIUM"].indexOf(body.tier) > 0;
  if (isUpgrade && (!body.last4 || !body.expMonth || !body.expYear)) {
    return NextResponse.json(
      { statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Card details required for upgrades", key: "billing.errors.cardRequired" },
      { status: 400 },
    );
  }

  const extraHeaders = await csrfEchoHeaders();
  const { data, errors } = await graphqlFetch<{
    subscribeToPlan: { success: boolean; reason?: string };
  }>(
    SUBSCRIBE_MUTATION,
    {
      tier: body.tier,
      last4: body.last4,
      expMonth: body.expMonth,
      expYear: body.expYear,
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
      { statusCode: 402, exc: "EX_BILLING_DECLINED", msg: result?.reason ?? "Payment declined", key: "billing.errors.declined" },
      { status: 402 },
    );
  }

  const meData = await graphqlFetch<{ me: { id: string; email: string; name?: string } }>(
    ME_QUERY,
    {},
    accessToken,
  );
  const user = meData?.data?.me;

  await publishEvent("billing.subscription.upgraded", {
    userId: user?.id ?? "unknown",
    email: user?.email ?? "unknown",
    name: user?.name ?? "User",
    tier: body.tier,
    label: tierLabel(body.tier),
    timestamp: new Date().toISOString(),
    event: "subscription.upgraded",
  });

  return NextResponse.json({ ok: true });
}
