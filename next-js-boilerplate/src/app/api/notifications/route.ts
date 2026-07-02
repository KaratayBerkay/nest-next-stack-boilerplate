import { NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import { MY_NOTIFICATIONS_QUERY } from "@/lib/graphql/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const take = searchParams.get("take");
  const token = await getAccessToken();

  const { data, errors } = await graphqlFetch<{
    myNotifications: unknown[];
  }>(
    MY_NOTIFICATIONS_QUERY,
    {
      cursor: cursor || undefined,
      take: take ? parseInt(take, 10) : undefined,
    },
    token,
  );

  if (errors) {
    return NextResponse.json({ error: errors[0].message }, { status: 500 });
  }

  return NextResponse.json({ notifications: data?.myNotifications ?? [] });
}
