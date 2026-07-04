import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorStatus, graphqlFetch } from "@/lib/backend";

const SET_USER_TIER_MUTATION = `
  mutation SetUserTier($userId: String!, $tier: SubscriptionTier!) {
    setUserTier(userId: $userId, tier: $tier)
  }
`;

export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { userId: string; tier: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.userId || !body.tier) {
    return NextResponse.json(
      { error: "userId and tier are required" },
      { status: 400 },
    );
  }

  const extraHeaders = await csrfEchoHeaders();
  const { data, errors } = await graphqlFetch<{ setUserTier: boolean }>(
    SET_USER_TIER_MUTATION,
    { userId: body.userId, tier: body.tier },
    accessToken,
    extraHeaders ?? undefined,
  );

  if (errors) {
    return NextResponse.json(
      { error: errors[0]?.message ?? "GraphQL error" },
      { status: graphqlErrorStatus(errors) },
    );
  }

  return NextResponse.json({ ok: data?.setUserTier ?? false });
}
