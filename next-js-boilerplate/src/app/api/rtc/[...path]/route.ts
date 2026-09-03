import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import {
  isSafeProxyPath,
  parseProxiedResponse,
  sessionTokenHeaders,
} from "@/lib/backend";
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

// Same catch-all BFF proxy shape as messages/[...path]/route.ts, but RtcController
// lives at `api/rtc` on the backend (not bare `api`), so `rtc/` has to be
// spelled out here rather than folded into the folder-consumed path segment.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!isSafeProxyPath(path)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  const qs = request.nextUrl.searchParams.toString();
  const url = `${serverEnv().APP_URL}/api/rtc/${path.join("/")}${qs ? "?" + qs : ""}`;
  const headers = await getAuthHeaders();
  const res = await fetch(url, { headers });
  return parseProxiedResponse(res, {
    route: "rtc/[...path]",
    method: "GET",
    path,
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
