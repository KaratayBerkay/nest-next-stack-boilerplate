import { NextResponse } from "next/server";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  deviceTokenCookieOptions,
  rbacTokenCookieOptions,
} from "@/lib/cookie";
import { graphqlFetch } from "@/lib/backend";

const REFRESH_QUERY = `
  mutation Refresh {
    refresh {
      accessToken
      refreshToken
      rbacToken
      deviceId
      deviceToken
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
  const { data, errors } = await graphqlFetch<{
    refresh: {
      accessToken: string;
      refreshToken: string;
      rbacToken?: string;
      deviceId?: string;
      deviceToken?: string;
      user: unknown;
    };
  }>(REFRESH_QUERY);

  if (errors || !data?.refresh) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const { accessToken, refreshToken, rbacToken, deviceToken, user } = data.refresh;

  const response = NextResponse.json({ user }, { status: 200 });

  response.cookies.set(accessTokenCookieOptions(accessToken));
  response.cookies.set(refreshTokenCookieOptions(refreshToken));
  if (rbacToken) response.cookies.set(rbacTokenCookieOptions(rbacToken));
  if (deviceToken) response.cookies.set(deviceTokenCookieOptions(deviceToken));

  return response;
}
