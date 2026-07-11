import "server-only";
import { cookies, headers as nextHeaders } from "next/headers";
import { DEVICE_TOKEN_COOKIE, RBAC_TOKEN_COOKIE, USER_TOKEN_COOKIE } from "./cookie";
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
  // Forward the client IP from the incoming request so the backend sees the real
  // browser IP (not the Next.js server's). Used by DeviceIpMiddleware for IP binding.
  const reqHeaders = await nextHeaders();
  const forwarded = reqHeaders.get("x-forwarded-for");
  return forwarded ? { "x-forwarded-for": forwarded } : {};
}

export async function sessionTokenHeaders(): Promise<Record<string, string>> {
  // The BFF's cookie names don't match the backend's production `__Secure-`
  // names, so forwarding the Cookie header alone isn't enough. Send the
  // fallback headers instead.
  const cookieStore = await cookies();
  const rbac = cookieStore.get(RBAC_TOKEN_COOKIE)?.value;
  const device = cookieStore.get(DEVICE_TOKEN_COOKIE)?.value;
  const user = cookieStore.get(USER_TOKEN_COOKIE)?.value;
  return {
    ...(rbac ? { "x-rbac-token": rbac } : {}),
    ...(device ? { "x-device-token": device } : {}),
    ...(user ? { "x-user-token": user } : {}),
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
    ...options,
    headers: {
      "Content-Type": "application/json",
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
  return process.env.NODE_ENV === "production" ? CSRF_COOKIE_PROD : CSRF_COOKIE_DEV;
}

/** Parse the name=value portion from a Set-Cookie header string. */
function parseSetCookieValue(setCookie: string, cookieName: string): string | null {
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
 * Cached per-process for 4 minutes (the CSRF cookie lives 5 minutes) so
 * repeated mutations share one backend round-trip instead of re-fetching.
 */
let cachedCsrf: { token: string; cookie: string; ts: number } | null = null;
const CSRF_CACHE_TTL_MS = 4 * 60 * 1000;

export async function csrfEchoHeaders(): Promise<Record<string, string> | null> {
  if (cachedCsrf && Date.now() - cachedCsrf.ts < CSRF_CACHE_TTL_MS) {
    return {
      "x-csrf-token": cachedCsrf.token,
      cookie: cachedCsrf.cookie,
    };
  }

  const csrfRes = await backendFetch<{ token: string }>("/csrf/token");
  const csrfToken = csrfRes.data?.token;
  if (!csrfToken) {
    cachedCsrf = null;
    return null;
  }

  const setCookieHeader = csrfRes.headers.get("set-cookie");
  const csrfCookieValue = setCookieHeader
    ? parseSetCookieValue(setCookieHeader, csrfCookieName())
    : null;

  if (csrfCookieValue) {
    cachedCsrf = { token: csrfToken, cookie: csrfCookieValue, ts: Date.now() };
  }

  return {
    "x-csrf-token": csrfToken,
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
  errors: { message: string; extensions?: { code?: string; exc?: string } }[] | undefined,
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
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      ...(await forwardedForHeader()),
      ...(await sessionTokenHeaders()),
      ...(extraHeaders ?? {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const body: GraphQlResponse<T> = await res.json();
  return { data: body.data, errors: body.errors, headers: res.headers };
}
