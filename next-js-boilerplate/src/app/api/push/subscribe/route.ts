import { type NextRequest, NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";

export async function POST(req: NextRequest) {
  const body: { endpoint?: string; keys?: { p256dh?: string; auth?: string } } =
    await req.json();
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json(
      { error: "Missing subscription fields" },
      { status: 400 },
    );
  }

  // JwtAuthGuard's cookie fallback uses the backend's prod cookie name
  // (__Secure-access_token), which never matches the BFF cookie — pass the
  // token as an explicit bearer instead.
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await graphqlFetch<{ subscribePush: { id: string } }>(
    `mutation($endpoint:String!,$p256dh:String!,$auth:String!,$userAgent:String) {
      subscribePush(endpoint:$endpoint,p256dh:$p256dh,auth:$auth,userAgent:$userAgent) { id }
    }`,
    {
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: req.headers.get("user-agent") ?? "",
    },
    token,
  );

  if (!result.data?.subscribePush) {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
