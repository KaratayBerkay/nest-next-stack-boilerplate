import { type NextRequest, NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/backend";

export async function POST(req: NextRequest) {
  const body: { endpoint?: string } = await req.json();
  if (!body.endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  const result = await graphqlFetch<{ unsubscribePush: boolean }>(
    `mutation($endpoint:String!) {
      unsubscribePush(endpoint:$endpoint)
    }`,
    { endpoint: body.endpoint },
  );

  if (!result.data?.unsubscribePush) {
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
