import { type NextRequest, NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";

export async function POST(req: NextRequest) {
  const body: { endpoint?: string } = await req.json();
  if (!body.endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  // Same bearer requirement as subscribe — the backend's prod cookie name
  // never matches the BFF cookie, so the cookie fallback cannot authenticate.
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await graphqlFetch<{ unsubscribePush: boolean }>(
    `mutation($endpoint:String!) {
      unsubscribePush(endpoint:$endpoint)
    }`,
    { endpoint: body.endpoint },
    token,
  );

  if (!result.data?.unsubscribePush) {
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
