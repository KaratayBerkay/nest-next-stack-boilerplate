import { type NextRequest, NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/backend";

export async function POST(req: NextRequest) {
  const body: { endpoint?: string; keys?: { p256dh?: string; auth?: string } } =
    await req.json();
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json(
      { error: "Missing subscription fields" },
      { status: 400 },
    );
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
  );

  if (!result.data?.subscribePush) {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
