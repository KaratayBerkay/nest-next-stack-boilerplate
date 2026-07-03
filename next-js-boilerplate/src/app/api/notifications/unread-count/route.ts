import { NextResponse } from "next/server";
import { graphqlErrorStatus, graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import { UNREAD_COUNT_QUERY } from "@/lib/graphql/queries";

export async function GET() {
  const token = await getAccessToken();

  const { data, errors } = await graphqlFetch<{
    unreadNotificationCount: number;
  }>(UNREAD_COUNT_QUERY, undefined, token);

  if (errors) {
    return NextResponse.json({ error: errors[0].message }, { status: graphqlErrorStatus(errors) });
  }

  return NextResponse.json({ count: data?.unreadNotificationCount ?? 0 });
}
