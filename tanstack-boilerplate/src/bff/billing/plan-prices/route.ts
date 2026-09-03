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
      features {
        key
        value
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  // Deliberately no auth gate: the backend's `planPrices` query is
  // `@Public()` (plan prices are the same for every viewer), and this route
  // is the guest-facing marketing pricing page's data source in addition to
  // the authenticated Plans/checkout pages — `graphqlFetch` already handles
  // an absent bearer token cleanly by just omitting the Authorization header.
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  const currency = request.nextUrl.searchParams.get("currency") ?? undefined;

  const { data, errors } = await graphqlFetch<{
    planPrices: {
      tier: string;
      priceCents: number;
      currency: string;
      features: { key: string; value?: string | null }[];
    }[];
  }>(PLAN_PRICES_QUERY, { currency }, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load plan prices");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ prices: data?.planPrices ?? [] });
}
