import { NextResponse } from "next/server";
import { graphqlErrorStatus, graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import { MY_NOTIFICATIONS_QUERY } from "@/lib/graphql/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const take = searchParams.get("take");
  const token = await getAccessToken();

  const pageSize = Math.min(Math.max(parseInt(take ?? "20", 10) || 20, 1), 100);
  const { data, errors } = await graphqlFetch<{
    myNotifications: { items: unknown[]; hasMore: boolean };
  }>(
    MY_NOTIFICATIONS_QUERY,
    {
      cursor: cursor || undefined,
      take: pageSize,
    },
    token,
  );

  if (errors) {
    return NextResponse.json(
      { error: errors[0]?.message ?? "GraphQL error" },
      { status: graphqlErrorStatus(errors) },
    );
  }

  // myNotifications already does the over-fetch-by-one/slice/hasMore
  // calculation server-side (see notification.resolver.ts) — pass it
  // through rather than re-deriving it from what's now a { items, hasMore }
  // shape, not a flat array.
  const { items = [], hasMore = false } = data?.myNotifications ?? {};
  return NextResponse.json({ items, hasMore });
}
