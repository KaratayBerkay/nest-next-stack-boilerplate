import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  deviceTokenCookieOptions,
  rbacTokenCookieOptions,
  userTokenCookieOptions,
} from "@/lib/cookie";
import { csrfEchoHeaders, graphqlFetch } from "@/lib/backend";

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

export async function POST() {
  // CSRF echo, then call refresh. The access token travels as Bearer so the
  // backend can revoke the old compound key before reissuing (the echo
  // replaces the Cookie header — see csrfEchoHeaders).
  const extraHeaders = await csrfEchoHeaders();
  if (!extraHeaders) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }
  const presentedAccessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

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
  }>(REFRESH_QUERY, undefined, presentedAccessToken, extraHeaders);

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
