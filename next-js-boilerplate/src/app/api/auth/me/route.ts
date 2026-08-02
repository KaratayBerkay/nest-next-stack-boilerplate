import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_USER_COOKIE, sessionUserCookieOptions } from "@/lib/cookie";
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
  let cookieUser: User | null = null;
  try {
    const cookieStore = await cookies();
    const encoded = cookieStore.get(SESSION_USER_COOKIE)?.value;
    if (encoded) {
      cookieUser = JSON.parse(decodeBase64(encoded)) as User;
      // Cookies minted before login/register/mfa started overlaying the real
      // `me` snapshot never carry hideAvatar (@HideField()'d on the
      // login/register mutation's user type). Self-heal instead of trusting
      // that partial snapshot for the rest of the session.
      if (cookieUser.hideAvatar !== undefined) {
        return NextResponse.json(
          { user: cookieUser, accessToken },
          { status: 200 },
        );
      }
    } else {
      log.warn({}, "me: no session_user cookie, falling through to GraphQL");
    }
  } catch (err) {
    log.warn(
      { error: (err as Error).message },
      "me: session_user cookie malformed, falling through to GraphQL",
    );
  }

  // Slow path: no session cookie (or one missing hideAvatar), fetch the full
  // snapshot from the backend.
  const { data, errors } = await graphqlFetch<{ me: Record<string, unknown> }>(
    ME_QUERY,
    undefined,
    accessToken,
  );

  if (errors || !data?.me) {
    if (cookieUser) {
      // Self-heal attempt failed but the session itself is still good —
      // keep serving the stale-but-valid cookie rather than logging the
      // user out over a transient GraphQL hiccup.
      return NextResponse.json(
        { user: cookieUser, accessToken },
        { status: 200 },
      );
    }
    log.warn(
      { exc: errors?.[0]?.extensions?.code },
      "me: GraphQL fallback also failed",
    );
    return NextResponse.json({ error: "Token expired" }, { status: 401 });
  }

  log.info({}, "me: GraphQL fallback succeeded");
  const mergedUser = cookieUser ? { ...cookieUser, ...data.me } : data.me;
  const response = NextResponse.json(
    { user: mergedUser, accessToken },
    { status: 200 },
  );
  response.cookies.set(
    sessionUserCookieOptions(
      Buffer.from(JSON.stringify(mergedUser)).toString("base64url"),
    ),
  );
  return response;
});
