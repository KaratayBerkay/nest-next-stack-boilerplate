import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import { graphqlFetch } from "@/lib/backend";
import {
  accessTokenCookieOptions,
  deviceTokenCookieOptions,
  rbacTokenCookieOptions,
  refreshTokenCookieOptions,
  sessionUserCookieOptions,
  userTokenCookieOptions,
} from "@/lib/cookie";
import { ME_QUERY } from "@/lib/graphql/queries";
import {
  DEVICE_TOKEN_HEADER,
  RBAC_TOKEN_HEADER,
  USER_TOKEN_HEADER,
} from "@/constants";

const LOGIN_WITH_OAUTH = `
  mutation LoginWithOAuth($profile: OAuthProfileInput!) {
    loginWithOAuth(profile: $profile) {
      accessToken
      rbacToken
      deviceId
      deviceToken
      userToken
      refreshToken
      user {
        id
        email
        name
        username
        avatarUrl
        locale
        timezone
        status
        role
        tier: subscriptionTier
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
        rbacToken?: string;
        deviceId?: string;
        deviceToken?: string;
        userToken?: string;
        refreshToken?: string;
        user: unknown;
      };
    }>(LOGIN_WITH_OAUTH, { profile });

    if (errors || !data?.loginWithOAuth) {
      const message = errors?.[0]?.message ?? "oauth_failed";
      loginUrl.searchParams.set("error", message);
      return NextResponse.redirect(loginUrl, 302);
    }

    const {
      accessToken,
      rbacToken,
      deviceToken,
      userToken,
      refreshToken,
      user,
    } = data.loginWithOAuth;

    // LOGIN_WITH_OAUTH's `user` selection is deliberately partial (same
    // constraint as the password-login route — can't select hideAvatar
    // (@HideField()'d) and omits chatNickname/sessionId). Overlay the real
    // `me` snapshot so the session_user cookie isn't born stale, and — more
    // importantly — carries `sessionId`, which getSessionUser()'s fast path
    // requires before it will trust the cookie without a live re-check.
    let sessionUser: unknown = user;
    if (accessToken && rbacToken && userToken) {
      const meResult = await graphqlFetch<{ me: Record<string, unknown> }>(
        ME_QUERY,
        undefined,
        accessToken,
        {
          [RBAC_TOKEN_HEADER]: rbacToken,
          ...(deviceToken ? { [DEVICE_TOKEN_HEADER]: deviceToken } : {}),
          [USER_TOKEN_HEADER]: userToken,
        },
      );
      if (meResult.data?.me) {
        sessionUser = {
          ...(user as Record<string, unknown>),
          ...meResult.data.me,
        };
      }
    }

    const response = NextResponse.redirect(env.NEXT_PUBLIC_APP_URL, 302);

    // Set all auth cookies directly from body values (not relayed Set-Cookie headers,
    // which the Fetch API strips from server-to-server responses).
    response.cookies.set(accessTokenCookieOptions(accessToken));
    if (rbacToken) response.cookies.set(rbacTokenCookieOptions(rbacToken));
    if (deviceToken)
      response.cookies.set(deviceTokenCookieOptions(deviceToken));
    if (userToken) response.cookies.set(userTokenCookieOptions(userToken));
    if (refreshToken)
      response.cookies.set(refreshTokenCookieOptions(refreshToken));
    response.cookies.set(
      sessionUserCookieOptions(
        Buffer.from(JSON.stringify(sessionUser)).toString("base64url"),
      ),
    );

    return response;
  } catch {
    loginUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(loginUrl, 302);
  }
}
