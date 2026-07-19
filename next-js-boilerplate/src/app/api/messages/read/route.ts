import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { sessionTokenHeaders } from "@/lib/backend";
import { POST as POST_METHOD } from "@/constants/api/methods";
import {
  JSON_CONTENT_TYPE_HEADER,
  bearerAuthHeader,
} from "@/constants/api/headers";

const BACKEND = serverEnv().APP_URL;

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();
  const url = `${BACKEND}/api/messages/read`;
  const stHeaders = await sessionTokenHeaders();
  const res = await fetch(url, {
    method: POST_METHOD,
    headers: {
      ...JSON_CONTENT_TYPE_HEADER,
      ...bearerAuthHeader(token),
      ...stHeaders,
    },
    body,
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
