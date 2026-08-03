import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_USER_COOKIE } from "@/lib/cookie";
import { graphqlFetch, sessionTokenHeaders } from "@/lib/backend";
import { ME_QUERY } from "@/lib/graphql/queries";
import { getAccessToken } from "@/store/ssr-cookies";
import type { User } from "@/types/auth/User";

function decodeBase64(value: string): string {
  return Buffer.from(value, "base64url").toString("utf-8");
}

async function fetchMe(accessToken: string): Promise<User | null> {
  try {
    const { data, errors } = await graphqlFetch<{ me: User }>(
      ME_QUERY,
      undefined,
      accessToken,
      await sessionTokenHeaders(),
    );
    return errors || !data?.me ? null : data.me;
  } catch {
    // A thrown network/parse error is just as transient as a GraphQL error
    // — treat it the same instead of letting it bubble past this check.
    return null;
  }
}

export const getSessionUser = cache(async (): Promise<User | null> => {
  // Fast path: read session_user cookie set at login/register time.
  let cookieUser: User | null = null;
  try {
    const cookieStore = await cookies();
    const encoded = cookieStore.get(SESSION_USER_COOKIE)?.value;
    if (encoded) {
      cookieUser = JSON.parse(decodeBase64(encoded)) as User;
      // Cookies minted before login/register/mfa started overlaying the real
      // `me` snapshot never carry hideAvatar (it can't even be selected on
      // the login/register mutation's `user` type — @HideField()'d). Rather
      // than trust that partial snapshot for the rest of the session, treat
      // a missing hideAvatar as a signal to self-heal from `me` below.
      if (cookieUser.hideAvatar !== undefined) {
        return cookieUser;
      }
    }
  } catch {
    // Malformed cookie — fall through to GraphQL.
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return cookieUser;
  }

  // One flaky call on this live check must not read as "logged out" — retry
  // once before falling back to the (possibly stale/absent) cookie snapshot,
  // so a single transient hiccup can't bounce the user to /auth/login.
  const me = (await fetchMe(accessToken)) ?? (await fetchMe(accessToken));
  if (!me) {
    return cookieUser;
  }

  return cookieUser ? { ...cookieUser, ...me } : me;
});
