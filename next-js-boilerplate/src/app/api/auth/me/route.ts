import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_USER_COOKIE } from "@/lib/cookie";
import { graphqlFetch } from "@/lib/backend";
import { ME_QUERY } from "@/lib/graphql/queries";
import { getAccessToken } from "@/store/ssr-cookies";
import { withLogging } from "@/lib/request-logger";
import type { User } from "@/features/auth/hooks/useAuth";

function decodeBase64(value: string): string {
  return Buffer.from(value, "base64url").toString("utf-8");
}

export const GET = withLogging(async (_request, log) => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    log.warn({}, "me: no access token");
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // Fast path: read session_user cookie created at login/register time (or
  // re-written by a mutation route since — see /api/profile/update,
  // /api/billing/subscribe).
  try {
    const cookieStore = await cookies();
    const encoded = cookieStore.get(SESSION_USER_COOKIE)?.value;
    if (encoded) {
      const user = JSON.parse(decodeBase64(encoded)) as User;
      return NextResponse.json({ user, accessToken }, { status: 200 });
    }
    log.warn({}, "me: no session_user cookie, falling through to GraphQL");
  } catch (err) {
    log.warn(
      { error: (err as Error).message },
      "me: session_user cookie malformed, falling through to GraphQL",
    );
  }

  // Slow path: no session cookie, fetch full user from backend.
  const { data, errors } = await graphqlFetch<{ me: unknown }>(
    ME_QUERY,
    undefined,
    accessToken,
  );

  if (errors || !data?.me) {
    log.warn(
      { exc: errors?.[0]?.extensions?.code },
      "me: GraphQL fallback also failed",
    );
    return NextResponse.json({ error: "Token expired" }, { status: 401 });
  }

  log.info({}, "me: GraphQL fallback succeeded");
  return NextResponse.json({ user: data.me, accessToken }, { status: 200 });
});
