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

const REGISTER_QUERY = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
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

export async function POST(request: Request) {
  let email: string;
  let password: string;
  let name: string | undefined;
  let timezone: string | undefined;

  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
    name = body.name;
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
    register: {
      accessToken: string;
      rbacToken?: string;
      deviceId?: string;
      deviceToken?: string;
      userToken?: string;
      refreshToken?: string;
      user: unknown;
    };
  }>(
    REGISTER_QUERY,
    {
      input: {
        email,
        password,
        ...(name ? { name } : {}),
        ...(timezone ? { timezone } : {}),
      },
    },
    undefined,
    undefined,
    true,
  );

  if (errors || !data?.register) {
    const body = graphqlErrorBody(errors, "Registration failed");
    if (body.exc === "EX_AUTH_EMAIL_TAKEN") {
      return NextResponse.json(
        { ...body, field: "email" },
        { status: body.statusCode },
      );
    }
    return NextResponse.json(body, { status: body.statusCode });
  }

  const { accessToken, rbacToken, deviceToken, userToken, refreshToken, user } =
    data.register;

  // See /api/auth/login: REGISTER_QUERY's `user` selection can't carry
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
      true,
    );
    if (meResult.data?.me) {
      sessionUser = {
        ...(user as Record<string, unknown>),
        ...meResult.data.me,
      };
    }
  }

  const response = NextResponse.json(
    // deviceToken stays: client JS seeds the wire-crypto key derivation
    // from it. accessToken deliberately does NOT — cookies carry it, and
    // echoing it in the body turns any XSS into durable token theft.
    { user: sessionUser, deviceToken },
    { status: 201 },
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

  return response;
}
