import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { parseProxiedResponse, sessionTokenHeaders } from "@/lib/backend";
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
  const body = await request.text();
  const url = `${serverEnv().APP_URL}/api/${path.join("/")}`;
  const headers = await getAuthHeaders();
  const res = await fetch(url, {
    method: POST_METHOD,
    headers,
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
