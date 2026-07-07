import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const BILLING_HISTORY_QUERY = `
  query MyBillingHistory {
    myBillingHistory {
      id
      type
      status
      amount
      currency
      reference
      stripeInvoiceUrl
      metadata
      createdAt
    }
  }
`;

// fallow-ignore-next-line complexity
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
      stripeInvoiceUrl?: string;
      metadata?: string;
      createdAt: string;
    }>;
  }>(BILLING_HISTORY_QUERY, {}, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load billing history");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ transactions: data?.myBillingHistory ?? [] });
}
