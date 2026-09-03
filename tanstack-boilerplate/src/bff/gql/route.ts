import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import {
  csrfEchoHeaders,
  forwardedForHeader,
  sessionTokenHeaders,
} from "@/lib/backend";
import { POST as POST_METHOD } from "@/constants/api/methods";
import {
  JSON_CONTENT_TYPE_HEADER,
  bearerAuthHeader,
} from "@/constants/api/headers";

// A GraphQL document either names its operation type explicitly
// ("mutation Foo(...) { ... }") or, omitted, defaults to a query shorthand
// ("{ ... }") — an operation is a mutation only if it says so up front.
const MUTATION_RE = /^\s*mutation\b/i;

function isMutation(rawBody: string): boolean {
  try {
    const { query } = JSON.parse(rawBody) as { query?: unknown };
    return typeof query === "string" && MUTATION_RE.test(query);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();

  // This passthrough forwards whatever operation the caller sends, unlike
  // every other BFF mutation route (which each wrap exactly one named
  // mutation) — so, uniquely here, the CSRF echo has to be conditional on
  // the body actually being a mutation rather than applying to every call.
  // Skipping it for queries keeps read traffic (the bulk of what hits this
  // route) off the extra backend round-trip.
  let extraHeaders: Record<string, string> = {};
  if (isMutation(body)) {
    const csrf = await csrfEchoHeaders();
    if (!csrf) {
      return NextResponse.json(
        { error: "Invalid or missing CSRF token" },
        { status: 403 },
      );
    }
    extraHeaders = csrf;
  }

  const url = `${serverEnv().APP_URL}/graphql`;
  const res = await fetch(url, {
    method: POST_METHOD,
    headers: {
      ...JSON_CONTENT_TYPE_HEADER,
      ...bearerAuthHeader(accessToken),
      ...(await forwardedForHeader()),
      ...(await sessionTokenHeaders()),
      ...extraHeaders,
    },
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
