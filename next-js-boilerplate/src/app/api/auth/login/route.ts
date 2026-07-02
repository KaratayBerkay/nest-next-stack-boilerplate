import { NextRequest, NextResponse } from "next/server";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  deviceTokenCookieOptions,
} from "@/lib/cookie";
import { graphqlFetch } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";

/**
 * Login BFF.
 *
 * The backend sets httpOnly cookies (device_token, refresh_token) via Set-Cookie
 * headers, but the standard Fetch API **strips** Set-Cookie from server-to-server
 * responses — the BFF never receives them.
 *
 * Instead, the backend returns the values in the GraphQL body, and the BFF sets
 * all 3 cookies directly. This also ensures every cookie carries the correct
 * Domain, SameSite, and Secure options from our central cookie helpers.
 */

const LOGIN_QUERY = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
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

export const POST = withLogging(async (request, log) => {
  let email: string;
  let password: string;

  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data, errors } = await graphqlFetch<{
    login: {
      accessToken: string;
      refreshToken: string;
      deviceId?: string;
      deviceToken?: string;
      user: unknown;
    };
  }>(LOGIN_QUERY, { input: { email, password } });

  if (errors || !data?.login) {
    const message = errors?.[0]?.message ?? "Login failed";
    const status = message === "Invalid credentials" ? 401 : 500;
    log.warn({ status, email }, "login failed");
    return NextResponse.json({ error: message }, { status });
  }

  const { accessToken, refreshToken, deviceToken, user } = data.login;

  const response = NextResponse.json({ user, accessToken }, { status: 200 });

  response.cookies.set(accessTokenCookieOptions(accessToken));
  response.cookies.set(refreshTokenCookieOptions(refreshToken));
  if (deviceToken) response.cookies.set(deviceTokenCookieOptions(deviceToken));

  log.info({ userId: (user as { id?: string })?.id }, "login succeeded");
  return response;
});
