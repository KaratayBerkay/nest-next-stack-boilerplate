import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import { graphqlFetch } from "@/lib/backend";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  deviceTokenCookieOptions,
} from "@/lib/cookie";

const LOGIN_WITH_OAUTH = `
  mutation LoginWithOAuth($profile: OAuthProfileInput!) {
    loginWithOAuth(profile: $profile) {
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerName } = await params;
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const env = serverEnv();
  const loginUrl = new URL("/auth/login", env.NEXT_PUBLIC_APP_URL);

  if (error) {
    loginUrl.searchParams.set("error", error);
    return NextResponse.redirect(loginUrl, 302);
  }

  if (!state) {
    loginUrl.searchParams.set("error", "missing_state");
    return NextResponse.redirect(loginUrl, 302);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (!savedState || savedState !== state) {
    loginUrl.searchParams.set("error", "state_mismatch");
    return NextResponse.redirect(loginUrl, 302);
  }

  try {
    const profileUrl = `${env.APP_URL}/auth/oauth/${providerName}/profile?state=${encodeURIComponent(state)}`;
    const profileRes = await fetch(profileUrl);
    if (!profileRes.ok) {
      loginUrl.searchParams.set("error", "profile_fetch_failed");
      return NextResponse.redirect(loginUrl, 302);
    }
    const profile = await profileRes.json();

    const { data, errors } = await graphqlFetch<{
      loginWithOAuth: {
        accessToken: string;
        refreshToken: string;
        deviceId?: string;
        deviceToken?: string;
        user: unknown;
      };
    }>(LOGIN_WITH_OAUTH, { profile });

    if (errors || !data?.loginWithOAuth) {
      const message = errors?.[0]?.message ?? "oauth_failed";
      loginUrl.searchParams.set("error", message);
      return NextResponse.redirect(loginUrl, 302);
    }

    const { accessToken, refreshToken, deviceToken } = data.loginWithOAuth;
    const response = NextResponse.redirect(env.NEXT_PUBLIC_APP_URL, 302);

    // Set all auth cookies directly from body values (not relayed Set-Cookie headers,
    // which the Fetch API strips from server-to-server responses).
    response.cookies.set(accessTokenCookieOptions(accessToken));
    response.cookies.set(refreshTokenCookieOptions(refreshToken));
    if (deviceToken)
      response.cookies.set(deviceTokenCookieOptions(deviceToken));

    return response;
  } catch {
    loginUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(loginUrl, 302);
  }
}
