import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const SUBSCRIPTION_QUERY = `
  query MySubscription {
    mySubscription {
      tier
      priceCents
      currency
      periodStart
      periodEnd
      cancelAtPeriodEnd
    }
  }
`;

// fallow-ignore-next-line complexity
export async function GET() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      {
        statusCode: 401,
        exc: "EX_AUTH_INVALID_CREDENTIALS",
        msg: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    mySubscription: {
      tier: string;
      priceCents: number;
      currency: string;
      periodStart: string;
      periodEnd: string;
      cancelAtPeriodEnd: boolean;
    } | null;
  }>(SUBSCRIPTION_QUERY, {}, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load subscription");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ subscription: data?.mySubscription ?? null });
}
