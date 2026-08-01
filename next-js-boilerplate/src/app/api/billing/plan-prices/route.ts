import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const PLAN_PRICES_QUERY = `
  query PlanPrices($currency: String) {
    planPrices(currency: $currency) {
      tier
      priceCents
      currency
    }
  }
`;

export async function GET(request: NextRequest) {
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

  const currency = request.nextUrl.searchParams.get("currency") ?? undefined;

  const { data, errors } = await graphqlFetch<{
    planPrices: { tier: string; priceCents: number; currency: string }[];
  }>(PLAN_PRICES_QUERY, { currency }, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load plan prices");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ prices: data?.planPrices ?? [] });
}
