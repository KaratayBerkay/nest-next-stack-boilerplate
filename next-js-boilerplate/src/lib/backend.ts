import "server-only";
import { createHash } from "node:crypto";
import { cookies, headers as nextHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { logger } from "./logger";
import {
  CSRF_TOKEN_HEADER,
  DEVICE_TOKEN_HEADER,
  JSON_CONTENT_TYPE_HEADER,
  POST,
  RBAC_TOKEN_HEADER,
  USER_AGENT_HEADER,
  USER_TOKEN_HEADER,
  X_FORWARDED_FOR_HEADER,
  bearerAuthHeader,
} from "@/constants";
import { CSRF_TOKEN_BACKEND_URL, GQL_BACKEND_PATH } from "@/constants/api/urls";
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

export async function userAgentHeader(): Promise<Record<string, string>> {
  const reqHeaders = await nextHeaders();
  const userAgent = reqHeaders.get(USER_AGENT_HEADER);
  return userAgent ? { [USER_AGENT_HEADER]: userAgent } : {};
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
    // no-store for the same reason as graphqlFetch below: the data cache
    // ignores headers, so cached authed responses are shared across users.
    // Callers may still opt into caching explicitly via `options`.
    cache: "no-store",
    ...options,
    headers: {
      ...JSON_CONTENT_TYPE_HEADER,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(await forwardedForHeader()),
      ...(await userAgentHeader()),
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

const UNSAFE_PROXY_SEGMENT_RE = /[/\\]/;

/**
 * Guards the catch-all `[...path]` proxy routes (rest/messages/rtc) before
 * their segments are joined into a backend URL. Next.js matches these
 * segments while still percent-encoded, so a segment whose *encoded* form
 * hides a slash (e.g. `..%2Fhealth`) never looks like a `..` path piece to
 * Next's own router — it only becomes one after this file's
 * `decodeURIComponent` runs, at which point concatenating it into a URL
 * string and handing that to `fetch()` lets standard RFC 3986 dot-segment
 * normalization walk the outbound request out of the intended `/api/*`
 * prefix and onto arbitrary other backend routes.
 */
export function isSafeProxyPath(path: string[]): boolean {
  return path.every(
    (segment) =>
      segment.length > 0 &&
      segment !== "." &&
      segment !== ".." &&
      !UNSAFE_PROXY_SEGMENT_RE.test(segment),
  );
}

/**
 * Thin proxy routes (messages/rest/usage/*) forward a raw backend `Response`
 * to the client as-is. When the body isn't valid JSON — a truncated response,
 * a gateway error page, a timeout — that's a real upstream failure, so it's
 * logged (with a body preview to see what actually came back) rather than
 * just handed to the client as a bare, unexplained 502.
 */
export async function parseProxiedResponse(
  res: Response,
  context: Record<string, unknown>,
): Promise<NextResponse> {
  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch (err) {
    logger.error(
      {
        ...context,
        category: "network",
        event: "proxy.invalid_backend_response",
        backendStatus: res.status,
        bodyPreview: text.slice(0, 200),
        err: err instanceof Error ? err.message : String(err),
      },
      "proxy: backend returned a non-JSON response",
    );
    return NextResponse.json(
      { error: "Invalid response from backend" },
      { status: 502 },
    );
  }
}

/**
 * Like `backendFetch`, but for multipart/form-data uploads: deliberately
 * omits a Content-Type header so `fetch` can generate the correct
 * `multipart/form-data; boundary=...` value itself — setting one manually
 * (as `backendFetch`'s JSON default would) breaks the backend's multipart
 * parsing. Also forwards cookies/session tokens/IP/UA like `backendFetch`,
 * plus an explicit bearerToken -> Authorization header (mirroring
 * graphqlFetch) since SessionAuthGuard's cookie fallback doesn't reliably
 * see the access_token cookie forwarded this way; all 3 upload routes were
 * 401ing with "Missing access token" on every call before this was added.
 */
export async function backendFormFetch<T = unknown>(
  path: string,
  formData: FormData,
  options: Omit<RequestInit, "body"> = {},
  bearerToken?: string,
): Promise<BackendResponse<T>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const url = `${backendBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: POST,
    ...options,
    body: formData,
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(bearerToken ? bearerAuthHeader(bearerToken) : {}),
      ...(await forwardedForHeader()),
      ...(await userAgentHeader()),
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

/**
 * Like `backendFormFetch`, but for raw streaming uploads: the request body
 * is piped straight to the backend (`duplex: "half"`), so the Next layer
 * never buffers the file. The caller owns `Content-Type`/`x-filename`/
 * `x-content-type` headers. Also forwards cookies/session tokens/IP/UA and
 * an explicit bearerToken -> Authorization header like `backendFormFetch`.
 */
export async function backendStreamFetch<T = unknown>(
  path: string,
  options: RequestInit & { body?: BodyInit; duplex?: "half" },
  bearerToken?: string,
): Promise<BackendResponse<T>> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const url = `${backendBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: POST,
    ...options,
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(bearerToken ? bearerAuthHeader(bearerToken) : {}),
      ...(await forwardedForHeader()),
      ...(await userAgentHeader()),
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

interface GraphQlErrorField {
  field: string;
  msg: string;
  key: string;
}

interface GraphQlError {
  message: string;
  extensions?: {
    code?: string;
    exc?: string;
    msg?: string;
    key?: string;
    statusCode?: number;
    fields?: GraphQlErrorField[];
  };
}

interface GraphQlResponse<T> {
  data?: T;
  errors?: GraphQlError[];
}

const CSRF_COOKIE_DEV = "csrf-token";
const CSRF_COOKIE_PROD = "__Host-csrf";

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

  const csrfRes = await backendFetch<{ token: string }>(CSRF_TOKEN_BACKEND_URL);
  const csrfToken = csrfRes.data?.token;
  if (!csrfToken) {
    return null;
  }

  // Read the name the backend actually used instead of guessing from our own
  // NODE_ENV: the frontend and backend are deployed independently, and
  // `next dev` always forces development mode even when it's pointed at a
  // production-mode backend (e.g. local testing against the compose stack),
  // so the two sides' "prod-ness" can't be assumed to match.
  const setCookieHeader = csrfRes.headers.get("set-cookie");
  const csrfCookieValue = setCookieHeader
    ? (parseSetCookieValue(setCookieHeader, CSRF_COOKIE_PROD) ??
      parseSetCookieValue(setCookieHeader, CSRF_COOKIE_DEV))
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
 * Returns `{ statusCode, exc, msg, key, fields? }` matching the backend's
 * global APP_FILTER shape — including the field-specific `fields` detail
 * (e.g. class-validator constraints) so callers can show why validation
 * failed instead of only the generic top-level message.
 */
export function graphqlErrorBody(
  errors: GraphQlError[] | undefined,
  defaultMsg?: string,
): {
  statusCode: number;
  exc: string;
  msg: string;
  key: string;
  fields?: GraphQlErrorField[];
} {
  const first = errors?.[0];
  const ext = first?.extensions ?? {};
  const exc = ext.exc ?? "EX_INTERNAL";
  const fields = ext.fields;
  let msg = ext.msg ?? first?.message ?? defaultMsg ?? "Internal server error";
  if (fields?.length) {
    const detail = fields.map((f) => f.msg).join(", ");
    msg = msg === "Validation failed" ? detail : `${msg}: ${detail}`;
  }
  const key = exc.toLowerCase().replace(/_/g, ".");
  return {
    statusCode: graphqlErrorStatus(errors),
    exc,
    msg,
    key,
    ...(fields?.length ? { fields } : {}),
  };
}

export function graphqlErrorStatus(
  errors: GraphQlError[] | undefined,
  fallback = 500,
): number {
  // The backend's global formatError (app.module.ts) always stamps the real
  // HTTP status onto extensions.statusCode via toExceptionResponse — trust it
  // first. EXC_TO_STATUS/code below are a fallback for errors that somehow
  // bypass that formatter, not the primary source of truth; keeping them
  // as a hand-maintained allowlist here previously meant any exc code not
  // explicitly listed (e.g. EX_AUTH_OTP_INVALID) silently defaulted to 500.
  const statusCode = errors?.[0]?.extensions?.statusCode;
  if (typeof statusCode === "number") return statusCode;
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
  noCache?: boolean,
): Promise<{ data?: T; errors?: GraphQlError[]; headers: Headers }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const url = `${backendBaseUrl()}${GQL_BACKEND_PATH}`;
  const res = await fetch(url, {
    method: POST,
    // Default no-store. Next's data cache keys on URL+method+BODY only —
    // the per-user auth (cookie/bearer) rides in HEADERS, which are not
    // part of the key, so any cached entry is shared across users: stale
    // reads (a notification list refetch served a 60s-old empty page,
    // making fresh notifications vanish from the dropdown) and potential
    // cross-user leakage of authed data (ME_QUERY has no variables — one
    // cache entry for everybody). `noCache === false` opts back into the
    // 60s cache for a genuinely public, user-independent query.
    ...(noCache === false
      ? { next: { revalidate: 60 } }
      : { cache: "no-store" as const }),
    headers: {
      ...JSON_CONTENT_TYPE_HEADER,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(bearerToken ? bearerAuthHeader(bearerToken) : {}),
      ...(await forwardedForHeader()),
      ...(await userAgentHeader()),
      ...(await sessionTokenHeaders()),
      ...(extraHeaders ?? {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const body: GraphQlResponse<T> = await res.json();
  return { data: body.data, errors: body.errors, headers: res.headers };
}
