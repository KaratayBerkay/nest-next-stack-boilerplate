import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_USER_COOKIE,
  accessTokenCookieOptions,
  deviceTokenCookieOptions,
  rbacTokenCookieOptions,
  refreshTokenCookieOptions,
  sessionUserCookieOptions,
  userTokenCookieOptions,
} from "@/lib/cookie";
import { csrfEchoHeaders, graphqlFetch } from "@/lib/backend";
import { REFRESH_TOKEN_HEADER } from "@/constants/api/headers";
import { withLogging } from "@/lib/request-logger";

/**
 * Silent session refresh (the real one — unlike /api/auth/token, which only
 * echoes the cookie jar back).
 *
 * Presents the refresh_token cookie to the backend `refresh` mutation, which
 * revokes the old compound session and mints a fresh token set. On success the
 * response rotates all four session cookies plus the refresh token itself.
 *
 * The backend reads the refresh token from the x-refresh-token header because
 * csrfEchoHeaders() replaces the forwarded Cookie header with the CSRF cookie
 * (double-submit). The old access token travels as Bearer so the backend can
 * revoke the compound key it was issued under.
 *
 * session_user's *content* is left untouched here — a refresh rotates the
 * session keys, not the user's identity snapshot — but its expiry is
 * re-armed to match the other session cookies. Its default maxAge (15min) is
 * far shorter than a session kept alive by refreshes, so without this it
 * expires out from under a still-active session; getSessionUser() then falls
 * onto its uncached, retry-less live `me` lookup on every request, and any
 * transient hiccup in that call bounces the user to /auth/login.
 */

const REFRESH_MUTATION = `
  mutation Refresh {
    refresh {
      accessToken
      rbacToken
      deviceId
      deviceToken
      userToken
      refreshToken
    }
  }
`;

export const POST = withLogging(async (_request, log) => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json(
      {
        statusCode: 401,
        exc: "EX_AUTH_INVALID_TOKEN",
        msg: "Missing refresh token",
        key: "auth.errors.sessionExpired",
      },
      { status: 401 },
    );
  }

  const extraHeaders = await csrfEchoHeaders();
  if (!extraHeaders) {
    return NextResponse.json(
      {
        statusCode: 500,
        exc: "EX_INTERNAL",
        msg: "CSRF handshake failed",
        key: "auth.errors.sessionExpired",
      },
      { status: 500 },
    );
  }
  extraHeaders[REFRESH_TOKEN_HEADER] = refreshToken;

  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const { data, errors } = await graphqlFetch<{
    refresh?: {
      accessToken?: string;
      rbacToken?: string;
      deviceId?: string;
      deviceToken?: string;
      userToken?: string;
      refreshToken?: string;
    };
  }>(REFRESH_MUTATION, undefined, accessToken, extraHeaders, true);

  if (errors || !data?.refresh?.accessToken) {
    log.warn(
      { exc: errors?.[0]?.extensions?.code },
      "session refresh rejected",
    );
    return NextResponse.json(
      {
        statusCode: 401,
        exc: "EX_AUTH_INVALID_TOKEN",
        msg: errors?.[0]?.message ?? "Session refresh failed",
        key: "auth.errors.sessionExpired",
      },
      { status: 401 },
    );
  }

  const r = data.refresh;
  const response = NextResponse.json(
    { accessToken: r.accessToken ?? "" },
    { status: 200 },
  );

  response.cookies.set(accessTokenCookieOptions(r.accessToken ?? ""));
  if (r.rbacToken) response.cookies.set(rbacTokenCookieOptions(r.rbacToken));
  if (r.deviceToken)
    response.cookies.set(deviceTokenCookieOptions(r.deviceToken));
  if (r.userToken) response.cookies.set(userTokenCookieOptions(r.userToken));
  if (r.refreshToken)
    response.cookies.set(refreshTokenCookieOptions(r.refreshToken));

  const sessionUser = cookieStore.get(SESSION_USER_COOKIE)?.value;
  if (sessionUser) response.cookies.set(sessionUserCookieOptions(sessionUser));

  log.info({}, "session refreshed");
  return response;
});
