import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  clearAccessTokenCookieOptions,
  clearRbacTokenCookieOptions,
  clearRefreshTokenCookieOptions,
  clearSessionUserCookieOptions,
  clearUserTokenCookieOptions,
} from "@/lib/cookie";
import { clearCsrfCache, csrfEchoHeaders, graphqlFetch } from "@/lib/backend";

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
      true,
    );
    revoked = !errors && data?.logout === true;
  }
  clearCsrfCache();
  if (!revoked) {
    console.error("[logout] backend session revocation failed");
  }

  // Clear the BFF cookies regardless — never strand the user logged in locally.
  // Deliberately NOT clearing device_token: it identifies this physical
  // browser (1-year lifetime, reused across logins via resolveForLogin), not
  // the session itself — clearing it on every logout meant every sign-out +
  // sign-back-in on the same device minted a brand-new Device row, which is
  // why Settings->Sessions showed multiple "sessions" for one real device.
  // There is no separate "forget this device" action anywhere that operates
  // on the Device table (Revoke/Revoke-others only touch Redis session keys),
  // so this cookie should outlive a routine logout.
  const response = NextResponse.json({ ok: true, revoked }, { status: 200 });
  response.cookies.set(clearAccessTokenCookieOptions());
  response.cookies.set(clearRbacTokenCookieOptions());
  response.cookies.set(clearUserTokenCookieOptions());
  response.cookies.set(clearSessionUserCookieOptions());
  response.cookies.set(clearRefreshTokenCookieOptions());
  return response;
}
