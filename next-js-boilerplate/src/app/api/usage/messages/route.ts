import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { sessionTokenHeaders } from "@/lib/backend";
import {
  JSON_CONTENT_TYPE_HEADER,
  bearerAuthHeader,
} from "@/constants/api/headers";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  const stHeaders = await sessionTokenHeaders();
  const headers: Record<string, string> = {
    ...JSON_CONTENT_TYPE_HEADER,
    ...stHeaders,
    ...(token ? bearerAuthHeader(token) : {}),
  };

  const params = request.nextUrl.searchParams;
  const query = new URLSearchParams();
  if (params.get("from")) query.set("from", params.get("from")!);
  if (params.get("to")) query.set("to", params.get("to")!);
  const qs = query.toString();

  const res = await fetch(
    `${serverEnv().APP_URL}/api/usage/messages${qs ? `?${qs}` : ""}`,
    { headers },
  );
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
