import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { forwardedForHeader, sessionTokenHeaders } from "@/lib/backend";
import { POST as POST_METHOD } from "@/constants/api/methods";
import {
  JSON_CONTENT_TYPE_HEADER,
  bearerAuthHeader,
} from "@/constants/api/headers";

const BACKEND = serverEnv().APP_URL;

export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();
  const url = `${BACKEND}/graphql`;
  const res = await fetch(url, {
    method: POST_METHOD,
    headers: {
      ...JSON_CONTENT_TYPE_HEADER,
      ...bearerAuthHeader(accessToken),
      ...(await forwardedForHeader()),
      ...(await sessionTokenHeaders()),
    },
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
