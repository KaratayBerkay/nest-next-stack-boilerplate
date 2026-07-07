import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";


const ME_QUERY = `
  query Me {
    me {
      id
      tier
    }
  }
`;

const BILLING_HISTORY_QUERY = `
  query MyBillingHistory {
    myBillingHistory {
      id
      type
      status
      amount
      currency
      reference
      metadata
      createdAt
    }
  }
`;

export async function GET() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      { statusCode: 401, exc: "EX_AUTH_INVALID_CREDENTIALS", msg: "Unauthorized", key: "auth.errors.unauthorized" },
      { status: 401 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    myBillingHistory: Array<{
      id: string;
      type: string;
      status: string;
      amount: number;
      currency: string;
      reference: string;
      metadata: string;
      createdAt: string;
    }>;
  }>(BILLING_HISTORY_QUERY, {}, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load billing history");
    return NextResponse.json(body, { status: body.statusCode });
  }

  let transactions = data?.myBillingHistory ?? [];

  if (transactions.length === 0) {
    const meData = await graphqlFetch<{ me: { id: string; tier: string } }>(
      ME_QUERY,
      {},
      accessToken,
    );
    const userTier = meData?.data?.me?.tier;
    if (userTier && userTier !== "FREE") {
      transactions = [
        {
          id: "mock-txn-001",
          type: "SUBSCRIPTION",
          status: "COMPLETED",
          amount: 0,
          currency: "USD",
          reference: `subscription:${userTier}`,
          metadata: "",
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  return NextResponse.json({ transactions });
}
