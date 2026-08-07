import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { sessionTokenHeaders } from "@/lib/backend";
import { bearerAuthHeader } from "@/constants/api/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const url = new URL(
    `${serverEnv().APP_URL}/api/conversations/${userId}/attachments`,
  );
  url.search = request.nextUrl.search;

  const res = await fetch(url.toString(), {
    headers: {
      ...bearerAuthHeader(token),
      ...(await sessionTokenHeaders()),
    },
  });

  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Invalid response from backend" },
      { status: 502 },
    );
  }
}
