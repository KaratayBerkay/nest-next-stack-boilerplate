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
import { encodeSessionUserCookie } from "@/lib/session-user-cookie";
import {
  DEVICE_TOKEN_HEADER,
  RBAC_TOKEN_HEADER,
  USER_TOKEN_HEADER,
} from "@/constants";
import { withLogging } from "@/lib/request-logger";

/**
 * Verify MFA challenge BFF.
 *
 * Completes the MFA login flow: accepts a mfaToken + 6-digit TOTP code,
 * calls verifyLoginMfa on the backend, and sets session cookies on success.
 */

const VERIFY_MFA_MUTATION = `
  mutation VerifyLoginMfa($input: VerifyLoginMfaInput!) {
    verifyLoginMfa(input: $input) {
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

export const POST = withLogging(async (request, log) => {
  let mfaToken: string;
  let code: string;

  try {
    const body = await request.json();
    mfaToken = body.mfaToken;
    code = body.code;
    if (!mfaToken || !code) {
      return NextResponse.json(
        {
          statusCode: 400,
          exc: "EX_VALIDATION_FORM",
          msg: "MFA token and code are required",
          key: "auth.errors.mfaRequired",
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
    verifyLoginMfa: {
      accessToken: string;
      rbacToken?: string;
      deviceId?: string;
      deviceToken?: string;
      userToken?: string;
      refreshToken?: string;
      user: unknown;
    };
  }>(VERIFY_MFA_MUTATION, {
    input: { mfaToken, code },
  });

  if (errors || !data?.verifyLoginMfa) {
    const body = graphqlErrorBody(errors, "MFA verification failed");
    log.warn({ status: body.statusCode }, "verifyLoginMfa failed");
    return NextResponse.json(body, { status: body.statusCode });
  }

  const { accessToken, rbacToken, deviceToken, userToken, refreshToken, user } =
    data.verifyLoginMfa;

  // See /api/auth/login: VERIFY_MFA_MUTATION's `user` selection can't carry
  // hideAvatar (@HideField()'d) and omits chatNickname, so overlay the real
  // `me` snapshot before it's born stale in the session_user cookie.
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
    { user: sessionUser, accessToken, deviceToken },
    { status: 200 },
  );

  response.cookies.set(accessTokenCookieOptions(accessToken));
  if (rbacToken) response.cookies.set(rbacTokenCookieOptions(rbacToken));
  if (deviceToken) response.cookies.set(deviceTokenCookieOptions(deviceToken));
  if (userToken) response.cookies.set(userTokenCookieOptions(userToken));
  if (refreshToken)
    response.cookies.set(refreshTokenCookieOptions(refreshToken));
  response.cookies.set(
    sessionUserCookieOptions(encodeSessionUserCookie(sessionUser)),
  );

  log.info({ userId: (user as { id?: string })?.id }, "MFA login succeeded");
  return response;
});
