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
    $paymentMethodId: String
  ) {
    subscribeToPlan(
      tier: $tier
      paymentMethodId: $paymentMethodId
    ) {
      success
      reason
      periodEnd
    }
  }
`;

// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      { statusCode: 401, exc: "EX_AUTH_INVALID_CREDENTIALS", msg: "Unauthorized", key: "auth.errors.unauthorized" },
      { status: 401 },
    );
  }

  let body: { tier: string; paymentMethodId?: string };
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

  const isUpgrade = ["BASIC", "MEDIUM", "PREMIUM"].includes(body.tier);
  if (isUpgrade && !body.paymentMethodId) {
    return NextResponse.json(
      { statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Payment method required for upgrades", key: "billing.errors.cardRequired" },
      { status: 400 },
    );
  }

  const extraHeaders = await csrfEchoHeaders();
  const { data, errors } = await graphqlFetch<{
    subscribeToPlan: { success: boolean; reason?: string; periodEnd?: string };
  }>(
    SUBSCRIBE_MUTATION,
    {
      tier: body.tier,
      paymentMethodId: body.paymentMethodId ?? null,
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

  return NextResponse.json({ ok: true, periodEnd: result.periodEnd ?? null });
}
