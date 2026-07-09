import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_USER_COOKIE } from "@/lib/cookie";
import { graphqlFetch } from "@/lib/backend";
import { ME_QUERY } from "@/lib/graphql/queries";
import { getAccessToken } from "@/store/ssr-cookies";
import type { User } from "@/features/auth/hooks/useAuth";

function decodeBase64(value: string): string {
  return Buffer.from(value, "base64url").toString("utf-8");
}

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // Fast path: read session_user cookie created at login/register time.
  try {
    const cookieStore = await cookies();
    const encoded = cookieStore.get(SESSION_USER_COOKIE)?.value;
    if (encoded) {
      const user = JSON.parse(decodeBase64(encoded)) as User;
      return NextResponse.json({ user, accessToken }, { status: 200 });
    }
  } catch {
    // Malformed cookie — fall through to GraphQL.
  }

  // Slow path: no session cookie, fetch full user from backend.
  const { data, errors } = await graphqlFetch<{ me: unknown }>(
    ME_QUERY,
    undefined,
    accessToken,
  );

  if (errors || !data?.me) {
    return NextResponse.json({ error: "Token expired" }, { status: 401 });
  }

  return NextResponse.json({ user: data.me, accessToken }, { status: 200 });
}
