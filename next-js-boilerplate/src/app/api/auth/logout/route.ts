import { NextResponse } from "next/server";
import {
  clearAccessTokenCookieOptions,
  clearRefreshCookieOptions,
  clearDeviceCookieOptions,
  clearRbacTokenCookieOptions,
  clearUserTokenCookieOptions,
} from "@/lib/cookie";
import { graphqlFetch } from "@/lib/backend";

const LOGOUT_QUERY = `
  mutation Logout {
    logout
  }
`;

export async function POST() {
  await graphqlFetch(LOGOUT_QUERY);

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(clearAccessTokenCookieOptions());
  response.cookies.set(clearRefreshCookieOptions());
  response.cookies.set(clearRbacTokenCookieOptions());
  response.cookies.set(clearDeviceCookieOptions());
  response.cookies.set(clearUserTokenCookieOptions());
  return response;
}
