import { NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { parseProxiedResponse, sessionTokenHeaders } from "@/lib/backend";
import {
  JSON_CONTENT_TYPE_HEADER,
  bearerAuthHeader,
} from "@/constants/api/headers";

export async function GET(_request: NextRequest) {
  const token = await getAccessToken();
  const stHeaders = await sessionTokenHeaders();
  const headers: Record<string, string> = {
    ...JSON_CONTENT_TYPE_HEADER,
    ...stHeaders,
    ...(token ? bearerAuthHeader(token) : {}),
  };

  const res = await fetch(`${serverEnv().APP_URL}/api/messages/unread-count`, {
    headers,
  });
  return parseProxiedResponse(res, {
    route: "messages/unread-count",
    method: "GET",
  });
}
