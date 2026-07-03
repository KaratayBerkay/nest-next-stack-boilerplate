import { NextResponse } from "next/server";
import { graphqlErrorStatus, graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import { MY_NOTIFICATIONS_QUERY } from "@/lib/graphql/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const take = searchParams.get("take");
  const token = await getAccessToken();

  const pageSize = Math.min(Math.max(parseInt(take ?? '20', 10) || 20, 1), 100);
  const { data, errors } = await graphqlFetch<{
    myNotifications: unknown[];
  }>(
    MY_NOTIFICATIONS_QUERY,
    {
      cursor: cursor || undefined,
      take: pageSize,
    },
    token,
  );

  if (errors) {
    return NextResponse.json({ error: errors[0].message }, { status: graphqlErrorStatus(errors) });
  }

  const raw = data?.myNotifications ?? [];
  const hasMore = raw.length > pageSize;
  const items = hasMore ? raw.slice(0, pageSize) : raw;
  return NextResponse.json({ items, hasMore });
}
