import { NextResponse } from "next/server";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  deviceTokenCookieOptions,
  rbacTokenCookieOptions,
  userTokenCookieOptions,
} from "@/lib/cookie";
import { graphqlFetch } from "@/lib/backend";

const REGISTER_QUERY = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      rbacToken
      deviceId
      deviceToken
      userToken
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

export async function POST(request: Request) {
  let email: string;
  let password: string;
  let name: string | undefined;

  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
    name = body.name;
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
    register: {
      accessToken: string;
      refreshToken: string;
      rbacToken?: string;
      deviceId?: string;
      deviceToken?: string;
      userToken?: string;
      user: unknown;
    };
  }>(REGISTER_QUERY, { input: { email, password, ...(name ? { name } : {}) } });

  if (errors || !data?.register) {
    const message = errors?.[0]?.message ?? "Registration failed";
    const status = message.includes("already") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }

  const { accessToken, refreshToken, rbacToken, deviceToken, userToken, user } = data.register;

  const response = NextResponse.json({ user, accessToken }, { status: 201 });

  response.cookies.set(accessTokenCookieOptions(accessToken));
  response.cookies.set(refreshTokenCookieOptions(refreshToken));
  if (rbacToken) response.cookies.set(rbacTokenCookieOptions(rbacToken));
  if (deviceToken) response.cookies.set(deviceTokenCookieOptions(deviceToken));
  if (userToken) response.cookies.set(userTokenCookieOptions(userToken));

  return response;
}
