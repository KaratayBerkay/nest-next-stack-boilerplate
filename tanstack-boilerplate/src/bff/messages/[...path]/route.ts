import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import {
  csrfEchoHeaders,
  isSafeProxyPath,
  parseProxiedResponse,
  sessionTokenHeaders,
} from "@/lib/backend";
import { POST as POST_METHOD } from "@/constants/api/methods";
import {
  JSON_CONTENT_TYPE_HEADER,
  bearerAuthHeader,
} from "@/constants/api/headers";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  const stHeaders = await sessionTokenHeaders();
  if (!token) return { ...JSON_CONTENT_TYPE_HEADER, ...stHeaders };
  return {
    ...JSON_CONTENT_TYPE_HEADER,
    ...bearerAuthHeader(token),
    ...stHeaders,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!isSafeProxyPath(path)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const qs = request.nextUrl.searchParams.toString();
  const url = `${serverEnv().APP_URL}/api/${path.join("/")}${qs ? "?" + qs : ""}`;
  const headers = await getAuthHeaders();
  const res = await fetch(url, { headers });
  return parseProxiedResponse(res, {
    route: "messages/[...path]",
    method: "GET",
    path,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!isSafeProxyPath(path)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const csrf = await csrfEchoHeaders();
  if (!csrf) {
    return NextResponse.json(
      { error: "Invalid or missing CSRF token" },
      { status: 403 },
    );
  }
  const body = await request.text();
  const url = `${serverEnv().APP_URL}/api/${path.join("/")}`;
  const headers = await getAuthHeaders();
  const res = await fetch(url, {
    method: POST_METHOD,
    headers: { ...headers, ...csrf },
    body,
  });
  return parseProxiedResponse(res, {
    route: "messages/[...path]",
    method: "POST",
    path,
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
