import { NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { parseProxiedResponse, sessionTokenHeaders } from "@/lib/backend";
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
  return parseProxiedResponse(res, { route: "usage/messages", method: "GET" });
}
