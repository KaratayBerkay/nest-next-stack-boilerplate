import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import { graphqlFetch } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";
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
  mutation LoginWithOAuth($input: OAuthLoginInput!) {
    loginWithOAuth(input: $input) {
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

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) => {
  const { provider: providerName } = await params;

  return withLogging(async (_request, log) => {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const env = serverEnv();
    const loginUrl = new URL("/auth/login", env.NEXT_PUBLIC_APP_URL);

    if (error) {
      log.warn(
        { provider: providerName, state, error },
        "oauth callback: provider error",
      );
      loginUrl.searchParams.set("error", error);
      return NextResponse.redirect(loginUrl, 302);
    }

    if (!state) {
      log.warn({ provider: providerName }, "oauth callback: missing state");
      loginUrl.searchParams.set("error", "missing_state");
      return NextResponse.redirect(loginUrl, 302);
    }

    const cookieStore = await cookies();
    const savedState = cookieStore.get("oauth_state")?.value;
    cookieStore.delete("oauth_state");

    if (!savedState || savedState !== state) {
      log.warn(
        {
          provider: providerName,
          state,
          hasSavedState: Boolean(savedState),
        },
        "oauth callback: state mismatch",
      );
      loginUrl.searchParams.set("error", "state_mismatch");
      return NextResponse.redirect(loginUrl, 302);
    }

    try {
      // The profile itself is never fetched or seen by this route anymore —
      // loginWithOAuth retrieves it server-to-server on the NestJS side by
      // redeeming `state` (a single-use claim ticket that only resolves to a
      // real profile once OAuthService.handleCallback completed a genuine
      // provider handshake). Forwarding a client-visible profile object here
      // was the account-takeover hole: anyone could fabricate one.
      log.info(
        { provider: providerName, state },
        "oauth callback: calling loginWithOAuth",
      );

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
      }>(LOGIN_WITH_OAUTH, { input: { state } }, undefined, undefined, true);

      if (errors || !data?.loginWithOAuth) {
        log.warn(
          {
            provider: providerName,
            state,
            exc: errors?.[0]?.extensions?.exc,
            statusCode: errors?.[0]?.extensions?.statusCode,
            code: errors?.[0]?.extensions?.code,
            message: errors?.[0]?.message,
          },
          "oauth callback: loginWithOAuth rejected",
        );
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
          true,
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

      log.info(
        {
          provider: providerName,
          state,
          userId: (user as { id?: string })?.id,
        },
        "oauth callback: success, session cookies set",
      );

      return response;
    } catch (err) {
      log.error(
        {
          provider: providerName,
          state,
          err: err instanceof Error ? err.message : String(err),
        },
        "oauth callback: unexpected failure",
      );
      loginUrl.searchParams.set("error", "oauth_failed");
      return NextResponse.redirect(loginUrl, 302);
    }
  })(request);
};
