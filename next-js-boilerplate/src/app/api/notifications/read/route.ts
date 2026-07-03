import { NextResponse } from "next/server";
import { graphqlErrorStatus, graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import {
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
} from "@/lib/graphql/queries";

export async function POST(request: Request) {
  let body: { id?: string; all?: boolean };
  const token = await getAccessToken();

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.all) {
    const { errors } = await graphqlFetch(
      MARK_ALL_NOTIFICATIONS_READ_MUTATION,
      undefined,
      token,
    );
    if (errors) {
      return NextResponse.json({ error: errors[0].message }, { status: graphqlErrorStatus(errors) });
    }
    return NextResponse.json({ ok: true });
  }

  if (!body.id) {
    return NextResponse.json(
      { error: "id is required (or all: true)" },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    markNotificationRead: boolean;
  }>(MARK_NOTIFICATION_READ_MUTATION, { id: body.id }, token);

  if (errors) {
    return NextResponse.json({ error: errors[0].message }, { status: graphqlErrorStatus(errors) });
  }

  return NextResponse.json({ ok: data?.markNotificationRead });
}
