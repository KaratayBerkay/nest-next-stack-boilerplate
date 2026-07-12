import { NextRequest, NextResponse } from "next/server";
import {
  accessTokenCookieOptions,
  deviceTokenCookieOptions,
  rbacTokenCookieOptions,
  sessionUserCookieOptions,
  userTokenCookieOptions,
} from "@/lib/cookie";
import {
  graphqlFetch,
  graphqlErrorBody,
  graphqlErrorStatus,
} from "@/lib/backend";
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
      mfaRequired
      mfaToken
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
      mfaRequired?: boolean;
      mfaToken?: string;
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
      { mfaRequired: true, mfaToken: loginData.mfaToken, user: loginData.user },
      { status: 202 },
    );
  }

  const { accessToken, rbacToken, deviceToken, userToken, user } = loginData;

  const response = NextResponse.json({ user, accessToken }, { status: 200 });

  if (accessToken) response.cookies.set(accessTokenCookieOptions(accessToken));
  if (rbacToken) response.cookies.set(rbacTokenCookieOptions(rbacToken));
  if (deviceToken) response.cookies.set(deviceTokenCookieOptions(deviceToken));
  if (userToken) response.cookies.set(userTokenCookieOptions(userToken));
  response.cookies.set(
    sessionUserCookieOptions(
      Buffer.from(JSON.stringify(user)).toString("base64url"),
    ),
  );

  log.info({ userId: (user as { id?: string })?.id }, "login succeeded");
  return response;
});
