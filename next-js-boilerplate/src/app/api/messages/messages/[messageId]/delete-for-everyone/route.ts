import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { sessionTokenHeaders } from "@/lib/backend";
import { POST as POST_METHOD } from "@/constants/api/methods";
import { bearerAuthHeader } from "@/constants/api/headers";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId } = await params;
  const url = `${serverEnv().APP_URL}/api/messages/${messageId}/delete-for-everyone`;
  const res = await fetch(url, {
    method: POST_METHOD,
    headers: {
      ...bearerAuthHeader(token),
      ...(await sessionTokenHeaders()),
    },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
