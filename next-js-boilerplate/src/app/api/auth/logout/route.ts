import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  clearAccessTokenCookieOptions,
  clearRefreshCookieOptions,
  clearDeviceCookieOptions,
  clearRbacTokenCookieOptions,
  clearUserTokenCookieOptions,
} from "@/lib/cookie";
import { csrfEchoHeaders, graphqlFetch } from "@/lib/backend";

const LOGOUT_QUERY = `
  mutation Logout {
    logout
  }
`;

export async function POST() {
  // The backend logout is CSRF-guarded and revokes the Redis compound key from
  // the presented tokens, so echo a CSRF token and pass the access token as
  // Bearer (the CSRF echo replaces the Cookie header — see csrfEchoHeaders).
  let revoked = false;
  const extraHeaders = await csrfEchoHeaders();
  if (extraHeaders) {
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    const { data, errors } = await graphqlFetch<{ logout: boolean }>(
      LOGOUT_QUERY,
      undefined,
      accessToken,
      extraHeaders,
    );
    revoked = !errors && data?.logout === true;
  }
  if (!revoked) {
    console.error("[logout] backend session revocation failed");
  }

  // Clear the BFF cookies regardless — never strand the user logged in locally.
  const response = NextResponse.json({ ok: true, revoked }, { status: 200 });
  response.cookies.set(clearAccessTokenCookieOptions());
  response.cookies.set(clearRefreshCookieOptions());
  response.cookies.set(clearRbacTokenCookieOptions());
  response.cookies.set(clearDeviceCookieOptions());
  response.cookies.set(clearUserTokenCookieOptions());
  return response;
}
