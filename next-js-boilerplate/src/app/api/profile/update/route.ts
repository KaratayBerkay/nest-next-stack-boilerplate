import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  SESSION_USER_COOKIE,
  sessionUserCookieOptions,
} from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const UPDATE_PROFILE = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) { id name username bio avatarUrl chatNickname useNickname locale timezone }
  }
`;

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken)
    return NextResponse.json({ statusCode: 401 }, { status: 401 });

  const extraHeaders = await csrfEchoHeaders();
  if (!extraHeaders)
    return NextResponse.json({ statusCode: 403 }, { status: 403 });

  let input: Record<string, unknown>;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Invalid JSON body",
        key: "errors.invalidJson",
      },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    updateProfile: Record<string, unknown>;
  }>(UPDATE_PROFILE, { input }, accessToken, extraHeaders);
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to update profile");
    return NextResponse.json(body, { status: body.statusCode });
  }

  const response = NextResponse.json(data);

  // `session_user` is otherwise only (re)written at login/register/MFA —
  // without refreshing it here, a saved profile change looks successful
  // (the mutation and Redis write both succeed) but `/api/auth/me`'s fast
  // path and SSR's `getSessionUser()` keep serving the pre-edit snapshot,
  // so the change appears to silently revert on the next refresh/reload.
  const encoded = cookieStore.get(SESSION_USER_COOKIE)?.value;
  if (encoded && data?.updateProfile) {
    try {
      const current = JSON.parse(
        Buffer.from(encoded, "base64url").toString("utf-8"),
      ) as Record<string, unknown>;
      const merged = { ...current, ...data.updateProfile };
      // hideAvatar isn't queryable on the mutation's own return type (it's
      // withheld from the generated User type everywhere but `me`, since
      // other users must never see it) — the mutation succeeding is proof
      // enough that whatever was requested is now the persisted value.
      if (typeof input.hideAvatar === "boolean") {
        merged.hideAvatar = input.hideAvatar;
      }
      response.cookies.set(
        sessionUserCookieOptions(
          Buffer.from(JSON.stringify(merged)).toString("base64url"),
        ),
      );
    } catch {
      // Malformed cookie — leave it be; ME_QUERY's GraphQL fallback covers it.
    }
  }

  return response;
}
