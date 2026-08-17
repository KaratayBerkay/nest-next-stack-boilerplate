import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { parseProxiedResponse, sessionTokenHeaders } from "@/lib/backend";
import { POST as POST_METHOD } from "@/constants/api/methods";
import {
  JSON_CONTENT_TYPE_HEADER,
  bearerAuthHeader,
} from "@/constants/api/headers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const url = new URL(
    `${serverEnv().APP_URL}/api/conversations/${userId}/messages`,
  );
  url.search = _request.nextUrl.search;

  const res = await fetch(url.toString(), {
    headers: {
      ...bearerAuthHeader(token),
      ...(await sessionTokenHeaders()),
    },
  });

  return parseProxiedResponse(res, {
    route: "messages/conversations/[userId]/messages",
    method: "GET",
    userId,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const body = await request.text();

  const res = await fetch(
    `${serverEnv().APP_URL}/api/conversations/${userId}/messages`,
    {
      method: POST_METHOD,
      headers: {
        ...JSON_CONTENT_TYPE_HEADER,
        ...bearerAuthHeader(token),
        ...(await sessionTokenHeaders()),
      },
      body,
    },
  );

  return parseProxiedResponse(res, {
    route: "messages/conversations/[userId]/messages",
    method: "POST",
    userId,
  });
}
