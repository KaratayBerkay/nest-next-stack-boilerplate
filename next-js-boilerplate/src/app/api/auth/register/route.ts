import { NextResponse } from "next/server";
import {
  accessTokenCookieOptions,
  deviceTokenCookieOptions,
  rbacTokenCookieOptions,
  userTokenCookieOptions,
} from "@/lib/cookie";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";

const REGISTER_QUERY = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
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
        { statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Email and password are required", key: "auth.errors.emailRequired" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Invalid JSON body", key: "auth.errors.invalidJson" }, { status: 400 });
  }

  const { data, errors } = await graphqlFetch<{
    register: {
      accessToken: string;
      rbacToken?: string;
      deviceId?: string;
      deviceToken?: string;
      userToken?: string;
      user: unknown;
    };
  }>(REGISTER_QUERY, {
    input: { email, password, ...(name ? { name } : {}), ...(timezone ? { timezone } : {}) },
  });

  if (errors || !data?.register) {
    const body = graphqlErrorBody(errors, "Registration failed");
    if (body.exc === "EX_AUTH_EMAIL_TAKEN") {
      return NextResponse.json({ ...body, field: "email" }, { status: body.statusCode });
    }
    return NextResponse.json(body, { status: body.statusCode });
  }

  const { accessToken, rbacToken, deviceToken, userToken, user } = data.register;

  const response = NextResponse.json({ user, accessToken }, { status: 201 });

  response.cookies.set(accessTokenCookieOptions(accessToken));
  if (rbacToken) response.cookies.set(rbacTokenCookieOptions(rbacToken));
  if (deviceToken) response.cookies.set(deviceTokenCookieOptions(deviceToken));
  if (userToken) response.cookies.set(userTokenCookieOptions(userToken));

  return response;
}
