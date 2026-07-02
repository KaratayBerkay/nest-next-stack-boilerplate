import { NextResponse } from "next/server";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  deviceTokenCookieOptions,
  rbacTokenCookieOptions,
  userTokenCookieOptions,
} from "@/lib/cookie";
import { backendFetch, graphqlFetch } from "@/lib/backend";

const REFRESH_QUERY = `
  mutation Refresh {
    refresh {
      accessToken
      refreshToken
      rbacToken
      deviceId
      deviceToken
      userToken
      user {
        id
        email
        name
        status
        role
      }
    }
  }
`;

/** Parse the name=value portion from a Set-Cookie header string. */
function parseSetCookieValue(setCookie: string, cookieName: string): string | null {
  const re = new RegExp(`(?:^|,\\s*)${cookieName}=([^;]+)`);
  const m = setCookie.match(re);
  return m ? `${cookieName}=${m[1]}` : null;
}

const CSRF_COOKIE_DEV = "csrf-token";
const CSRF_COOKIE_PROD = "__Host-csrf";

function csrfCookieName(): string {
  return process.env.NODE_ENV === "production" ? CSRF_COOKIE_PROD : CSRF_COOKIE_DEV;
}

export async function POST() {
  // 1. Perform CSRF echo: fetch a fresh CSRF token from the backend.
  const csrfRes = await backendFetch<{ token: string }>("/csrf/token");
  const csrfToken = csrfRes.data?.token;

  if (!csrfToken) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  // 2. Extract CSRF cookie value from the response Set-Cookie header.
  const cookieName = csrfCookieName();
  const setCookieHeader = csrfRes.headers.get("set-cookie");
  const csrfCookieValue = setCookieHeader
    ? parseSetCookieValue(setCookieHeader, cookieName)
    : null;

  // 3. Call the refresh mutation, echoing the CSRF token + cookie.
  const extraHeaders: Record<string, string> = {
    "x-csrf-token": csrfToken,
  };
  if (csrfCookieValue) {
    extraHeaders["cookie"] = csrfCookieValue;
  }

  const { data, errors } = await graphqlFetch<{
    refresh: {
      accessToken: string;
      refreshToken: string;
      rbacToken?: string;
      deviceId?: string;
      deviceToken?: string;
      userToken?: string;
      user: unknown;
    };
  }>(REFRESH_QUERY, undefined, undefined, extraHeaders);

  if (errors || !data?.refresh) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const { accessToken, refreshToken, rbacToken, deviceToken, userToken, user } = data.refresh;

  const response = NextResponse.json({ user }, { status: 200 });

  response.cookies.set(accessTokenCookieOptions(accessToken));
  response.cookies.set(refreshTokenCookieOptions(refreshToken));
  if (rbacToken) response.cookies.set(rbacTokenCookieOptions(rbacToken));
  if (deviceToken) response.cookies.set(deviceTokenCookieOptions(deviceToken));
  if (userToken) response.cookies.set(userTokenCookieOptions(userToken));

  return response;
}
