import "server-only";
import { graphqlFetch, sessionTokenHeaders } from "@/lib/backend";
import { ME_QUERY } from "@/lib/graphql/queries";
import { getAccessToken } from "@/store/ssr-cookies";
import type { User } from "@/features/auth/hooks/useAuth";

/**
 * Server-side session user resolver. Returns the full `SessionUserPayload` for
 * the current request by reading the `access_token` cookie and calling the
 * backend `me` query — zero Postgres on the backend side (Redis-served).
 *
 * Returns `null` when no session exists (guest) or the token is expired.
 * Intended for the root layout's `initialUser` prop on `AuthProvider` to
 * eliminate the logged-out flash on hard reloads.
 */
export async function getSessionUser(): Promise<User | null> {
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
}
