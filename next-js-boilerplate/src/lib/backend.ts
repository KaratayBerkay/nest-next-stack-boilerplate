import "server-only";
import { createHash } from "node:crypto";
import { cookies, headers as nextHeaders } from "next/headers";
import {
  CSRF_TOKEN_HEADER,
  DEVICE_TOKEN_HEADER,
  JSON_CONTENT_TYPE_HEADER,
  POST,
  RBAC_TOKEN_HEADER,
  USER_TOKEN_HEADER,
  X_FORWARDED_FOR_HEADER,
  bearerAuthHeader,
} from "@/constants";
import {
  DEVICE_TOKEN_COOKIE,
  RBAC_TOKEN_COOKIE,
  USER_TOKEN_COOKIE,
} from "./cookie";
import { serverEnv } from "./env";

export interface BackendResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  headers: Headers;
}

function backendBaseUrl(): string {
  return serverEnv().APP_URL;
}

export async function forwardedForHeader(): Promise<Record<string, string>> {
  const reqHeaders = await nextHeaders();
  const forwarded = reqHeaders.get(X_FORWARDED_FOR_HEADER);
  return forwarded ? { [X_FORWARDED_FOR_HEADER]: forwarded } : {};
}

export async function sessionTokenHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const rbac = cookieStore.get(RBAC_TOKEN_COOKIE)?.value;
  const device = cookieStore.get(DEVICE_TOKEN_COOKIE)?.value;
  const user = cookieStore.get(USER_TOKEN_COOKIE)?.value;
  return {
    ...(rbac ? { [RBAC_TOKEN_HEADER]: rbac } : {}),
    ...(device ? { [DEVICE_TOKEN_HEADER]: device } : {}),
    ...(user ? { [USER_TOKEN_HEADER]: user } : {}),
  };
}

export async function backendFetch<T = unknown>(
  path: string,
  options: RequestInit & { body?: BodyInit } = {},
): Promise<BackendResponse<T>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const url = `${backendBaseUrl()}${path}`;
  const res = await fetch(url, {
    next: { revalidate: 60 },
    ...options,
    headers: {
      ...JSON_CONTENT_TYPE_HEADER,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(await forwardedForHeader()),
      ...(await sessionTokenHeaders()),
      ...options.headers,
    },
  });

  let data: T;
  try {
    data = (await res.json()) as T;
  } catch {
    data = null as unknown as T;
  }

  return { ok: res.ok, status: res.status, data, headers: res.headers };
}

interface GraphQlError {
  message: string;
  extensions?: { code?: string };
}

interface GraphQlResponse<T> {
  data?: T;
  errors?: GraphQlError[];
}

const CSRF_COOKIE_DEV = "csrf-token";
const CSRF_COOKIE_PROD = "__Host-csrf";

function csrfCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? CSRF_COOKIE_PROD
    : CSRF_COOKIE_DEV;
}

interface CsrfCacheEntry {
  token: string;
  cookie: string;
  ts: number;
}

const CSRF_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const csrfCache = new Map<string, CsrfCacheEntry>();

function sessionCacheKey(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): string {
  const rbac = cookieStore.get(RBAC_TOKEN_COOKIE)?.value ?? "";
  const device = cookieStore.get(DEVICE_TOKEN_COOKIE)?.value ?? "";
  const user = cookieStore.get(USER_TOKEN_COOKIE)?.value ?? "";
  return createHash("sha256").update(`${rbac}:${device}:${user}`).digest("hex");
}

/**
 * Evict expired entries from the CSRF cache. Runs lazily on each miss.
 */
function evictStale(): void {
  const now = Date.now();
  for (const [key, entry] of csrfCache) {
    if (now - entry.ts > CSRF_CACHE_TTL_MS) csrfCache.delete(key);
  }
}

/**
 * Clear the cached CSRF entry for the current session (call on logout).
 */
export async function clearCsrfCache(): Promise<void> {
  try {
    const cs = await cookies();
    csrfCache.delete(sessionCacheKey(cs));
  } catch {
    // cookies() may throw during build/static generation
  }
}

/** Parse the name=value portion from a Set-Cookie header string. */
function parseSetCookieValue(
  setCookie: string,
  cookieName: string,
): string | null {
  const re = new RegExp(`(?:^|,\\s*)${cookieName}=([^;]+)`);
  const m = setCookie.match(re);
  return m ? `${cookieName}=${m[1]}` : null;
}

/**
 * Fetch a fresh CSRF token from the backend and build the extra headers that
 * echo it back (double-submit: `x-csrf-token` + the CSRF cookie). The returned
 * `cookie` entry REPLACES the forwarded Cookie header in graphqlFetch, so the
 * session tokens must travel via the Authorization / x-*-token fallbacks.
 * Returns null when the backend won't issue a token (e.g. unreachable).
 *
 * Session-scoped cache: keyed by a hash of the caller's session cookies so
 * multiple mutations within the same request batch share one CSRF token without
 * cross-session contamination.
 */
export async function csrfEchoHeaders(): Promise<Record<
  string,
  string
> | null> {
  const cookieStore = await cookies();
  const key = sessionCacheKey(cookieStore);
  evictStale();

  const cached = csrfCache.get(key);
  if (cached && Date.now() - cached.ts < CSRF_CACHE_TTL_MS) {
    return {
      [CSRF_TOKEN_HEADER]: cached.token,
      ...(cached.cookie ? { cookie: cached.cookie } : {}),
    };
  }

  const csrfRes = await backendFetch<{ token: string }>("/csrf/token");
  const csrfToken = csrfRes.data?.token;
  if (!csrfToken) {
    return null;
  }

  const setCookieHeader = csrfRes.headers.get("set-cookie");
  const csrfCookieValue = setCookieHeader
    ? parseSetCookieValue(setCookieHeader, csrfCookieName())
    : null;

  csrfCache.set(key, {
    token: csrfToken,
    cookie: csrfCookieValue ?? "",
    ts: Date.now(),
  });

  return {
    [CSRF_TOKEN_HEADER]: csrfToken,
    ...(csrfCookieValue ? { cookie: csrfCookieValue } : {}),
  };
}

/**
 * HTTP status a BFF route should return for a GraphQL error. UNAUTHENTICATED
 * must surface as 401 — apiFetch's silent refresh only triggers on 401.
 */
const EXC_TO_STATUS: Record<string, number> = {
  EX_AUTH_INVALID_CREDENTIALS: 401,
  EX_AUTH_ACCOUNT_LOCKED: 401,
  EX_AUTH_EMAIL_TAKEN: 409,
  EX_CONFLICT_DUPLICATE: 409,
  EX_NOT_FOUND: 404,
  EX_FORBIDDEN: 403,
  EX_VALIDATION_FORM: 400,
  EX_TIER_INSUFFICIENT: 403,
};

/**
 * Build a unified error response body from a GraphQL error array.
 * Returns `{ statusCode, exc, msg, key }` matching the backend's
 * global APP_FILTER shape.
 */
export function graphqlErrorBody(
  errors:
    | { message: string; extensions?: { code?: string; exc?: string } }[]
    | undefined,
  defaultMsg?: string,
): { statusCode: number; exc: string; msg: string; key: string } {
  const exc = errors?.[0]?.extensions?.exc ?? "EX_INTERNAL";
  const msg = errors?.[0]?.message ?? defaultMsg ?? "Internal server error";
  const key = exc.toLowerCase().replace(/_/g, ".");
  return { statusCode: graphqlErrorStatus(errors), exc, msg, key };
}

export function graphqlErrorStatus(
  errors: { extensions?: { code?: string; exc?: string } }[] | undefined,
  fallback = 500,
): number {
  const exc = errors?.[0]?.extensions?.exc;
  if (exc && exc in EXC_TO_STATUS) return EXC_TO_STATUS[exc];
  const code = errors?.[0]?.extensions?.code;
  if (code === "UNAUTHENTICATED") return 401;
  if (code === "FORBIDDEN") return 403;
  return fallback;
}

export async function graphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  bearerToken?: string,
  extraHeaders?: Record<string, string>,
): Promise<{ data?: T; errors?: GraphQlError[]; headers: Headers }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const url = `${backendBaseUrl()}/graphql`;
  const res = await fetch(url, {
    method: POST,
    next: { revalidate: 60 },
    headers: {
      ...JSON_CONTENT_TYPE_HEADER,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(bearerToken ? bearerAuthHeader(bearerToken) : {}),
      ...(await forwardedForHeader()),
      ...(await sessionTokenHeaders()),
      ...(extraHeaders ?? {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const body: GraphQlResponse<T> = await res.json();
  return { data: body.data, errors: body.errors, headers: res.headers };
}
