import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlFetch, sessionTokenHeaders } from "@/lib/backend";

const PREMIUM_STATS_QUERY = `
  query PremiumStats {
    premiumStats {
      totalUsers
      activeUsers
      revenue
    }
  }
`;

export async function GET() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, errors } = await graphqlFetch<{
    premiumStats: { totalUsers: number; activeUsers: number; revenue: number };
  }>(PREMIUM_STATS_QUERY, undefined, accessToken, await sessionTokenHeaders());

  if (errors) {
    const status =
      errors[0]?.extensions?.code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: errors[0].message }, { status });
  }

  return NextResponse.json({ stats: data?.premiumStats });
}
