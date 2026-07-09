import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_USER_COOKIE } from "@/lib/cookie";
import { graphqlFetch, sessionTokenHeaders } from "@/lib/backend";
import { ME_QUERY } from "@/lib/graphql/queries";
import { getAccessToken } from "@/store/ssr-cookies";
import type { User } from "@/features/auth/hooks/useAuth";

function decodeBase64(value: string): string {
  return Buffer.from(value, "base64url").toString("utf-8");
}

export const getSessionUser = cache(async (): Promise<User | null> => {
  // Fast path: read session_user cookie set at login/register time.
  try {
    const cookieStore = await cookies();
    const encoded = cookieStore.get(SESSION_USER_COOKIE)?.value;
    if (encoded) {
      return JSON.parse(decodeBase64(encoded)) as User;
    }
  } catch {
    // Malformed cookie — fall through to GraphQL.
  }

  // Fallback: no session cookie, query backend me query (old sessions).
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const { data, errors } = await graphqlFetch<{ me: User }>(
    ME_QUERY,
    undefined,
    accessToken,
    await sessionTokenHeaders(),
  );

  if (errors || !data?.me) return null;

  return data.me;
});
