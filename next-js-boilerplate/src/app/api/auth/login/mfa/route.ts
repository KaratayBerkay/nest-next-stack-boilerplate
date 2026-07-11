import { NextRequest, NextResponse } from "next/server";
import {
  accessTokenCookieOptions,
  deviceTokenCookieOptions,
  rbacTokenCookieOptions,
  sessionUserCookieOptions,
  userTokenCookieOptions,
} from "@/lib/cookie";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
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
        { statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "MFA token and code are required", key: "auth.errors.mfaRequired" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Invalid JSON body", key: "auth.errors.invalidJson" }, { status: 400 });
  }

  const { data, errors } = await graphqlFetch<{
    verifyLoginMfa: {
      accessToken: string;
      rbacToken?: string;
      deviceId?: string;
      deviceToken?: string;
      userToken?: string;
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

  const { accessToken, rbacToken, deviceToken, userToken, user } = data.verifyLoginMfa;

  const response = NextResponse.json({ user, accessToken }, { status: 200 });

  response.cookies.set(accessTokenCookieOptions(accessToken));
  if (rbacToken) response.cookies.set(rbacTokenCookieOptions(rbacToken));
  if (deviceToken) response.cookies.set(deviceTokenCookieOptions(deviceToken));
  if (userToken) response.cookies.set(userTokenCookieOptions(userToken));
  response.cookies.set(
    sessionUserCookieOptions(
      Buffer.from(JSON.stringify(user)).toString("base64url"),
    ),
  );

  log.info({ userId: (user as { id?: string })?.id }, "MFA login succeeded");
  return response;
});
