import { NextResponse } from "next/server";
import {
  accessTokenCookieOptions,
  deviceTokenCookieOptions,
  rbacTokenCookieOptions,
  refreshTokenCookieOptions,
  sessionUserCookieOptions,
  userTokenCookieOptions,
} from "@/lib/cookie";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { ME_QUERY } from "@/lib/graphql/queries";
import {
  DEVICE_TOKEN_HEADER,
  RBAC_TOKEN_HEADER,
  USER_TOKEN_HEADER,
} from "@/constants";
import { withLogging } from "@/lib/request-logger";

/**
 * Login BFF.
 *
 * The backend sets httpOnly cookies (device_token, refresh_token, rbac_token) via Set-Cookie
 * headers, but the standard Fetch API **strips** Set-Cookie from server-to-server
 * responses — the BFF never receives them.
 *
 * Instead, the backend returns the values in the GraphQL body, and the BFF sets
 * all 4 cookies directly. This also ensures every cookie carries the correct
 * Domain, SameSite, and Secure options from our central cookie helpers.
 *
 * When the user has MFA enabled, the backend returns mfaRequired:true instead of
 * tokens. The BFF returns 202 with { mfaRequired: true, mfaToken } so the
 * frontend can show the TOTP challenge form.
 */

const LOGIN_QUERY = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      rbacToken
      deviceId
      deviceToken
      userToken
      refreshToken
      mfaRequired
      mfaToken
      mfaMethod
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

export const POST = withLogging(async (request, log) => {
  let email: string;
  let password: string;
  let timezone: string | undefined;

  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
    timezone = body.timezone;
    if (!email || !password) {
      return NextResponse.json(
        {
          statusCode: 400,
          exc: "EX_VALIDATION_FORM",
          msg: "Email and password are required",
          key: "auth.errors.emailRequired",
        },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Invalid JSON body",
        key: "auth.errors.invalidJson",
      },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    login: {
      accessToken?: string;
      rbacToken?: string;
      deviceId?: string;
      deviceToken?: string;
      userToken?: string;
      refreshToken?: string;
      mfaRequired?: boolean;
      mfaToken?: string;
      mfaMethod?: "TOTP" | "EMAIL";
      user: unknown;
    };
  }>(LOGIN_QUERY, {
    input: { email, password, ...(timezone ? { timezone } : {}) },
  });

  if (errors || !data?.login) {
    const body = graphqlErrorBody(errors, "Login failed");
    log.warn({ status: body.statusCode, email }, "login failed");
    return NextResponse.json(body, { status: body.statusCode });
  }

  const loginData = data.login;

  // MFA challenge: return 202 so the frontend shows the TOTP form.
  if (loginData.mfaRequired) {
    log.info({ email }, "login requires MFA challenge");
    return NextResponse.json(
      {
        mfaRequired: true,
        mfaToken: loginData.mfaToken,
        mfaMethod: loginData.mfaMethod,
        user: loginData.user,
      },
      { status: 202 },
    );
  }

  const { accessToken, rbacToken, deviceToken, userToken, refreshToken, user } =
    loginData;

  // LOGIN_QUERY's `user` selection is deliberately partial (it can't select
  // hideAvatar at all — @HideField()'d on the User type — and omits
  // chatNickname). Overlay the real `me` snapshot so the session_user cookie
  // (and the login response the client hydrates from) isn't born stale —
  // same bug class fixed for tier in /api/billing/subscribe.
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

  const response = NextResponse.json(
    { user: sessionUser, accessToken },
    { status: 200 },
  );

  if (accessToken) response.cookies.set(accessTokenCookieOptions(accessToken));
  if (rbacToken) response.cookies.set(rbacTokenCookieOptions(rbacToken));
  if (deviceToken) response.cookies.set(deviceTokenCookieOptions(deviceToken));
  if (userToken) response.cookies.set(userTokenCookieOptions(userToken));
  if (refreshToken)
    response.cookies.set(refreshTokenCookieOptions(refreshToken));
  response.cookies.set(
    sessionUserCookieOptions(
      Buffer.from(JSON.stringify(sessionUser)).toString("base64url"),
    ),
  );

  log.info({ userId: (user as { id?: string })?.id }, "login succeeded");
  return response;
});
