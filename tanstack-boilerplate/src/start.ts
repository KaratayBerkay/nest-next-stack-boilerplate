// TanStack Start instance + global request middleware.
// This is the port of Next.js `src/proxy.ts` (middleware): legacy redirects,
// i18n locale negotiation, /{version}/{lang} canonicalization, auth gating,
// the /security/* strict CSP, and the x-request-id / x-lang / x-proxy
// response headers.

import { createMiddleware, createStart } from "@tanstack/react-start";
import {
  ACCESS_TOKEN_COOKIE,
  DEVICE_TOKEN_COOKIE,
  RBAC_TOKEN_COOKIE,
} from "@/lib/cookie";
import { defaultLocale, isLocale, resolveLocale } from "@/lib/i18n/config";
import { defaultVersion, isVersion, isVersionLike } from "@/lib/version/config";
import { LANG_COOKIE } from "@/constants/i18n";
import { securityHeadersFor } from "@/lib/security-headers";
import type { Lang } from "@/constants/i18n";
import { LOGIN_PATH } from "@/constants/routes";
import { parseCookieHeader, serializeCookie } from "@/compat/next/server";

const LANG_COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

const ASSET_HOST = process.env.NEXT_PUBLIC_ASSET_HOST ?? "";

/**
 * Strict, nonce-based Content-Security-Policy for /security/*.
 * `'strict-dynamic'` + a per-request nonce means only scripts tagged with
 * this nonce may run — no `'unsafe-inline'`. In dev, React needs
 * `'unsafe-eval'` and Vite injects inline styles.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`};
    img-src 'self' blob: data: ${ASSET_HOST};
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

const REQUEST_ID_HEADER = "x-request-id";
const CORRELATION_ID_HEADER = "x-correlation-id";
const REQUEST_ID_RE = /^[A-Za-z0-9._-]{1,128}$/;

function parseRequestId(request: Request): string {
  const raw =
    request.headers.get(REQUEST_ID_HEADER) ??
    request.headers.get(CORRELATION_ID_HEADER);
  if (raw && REQUEST_ID_RE.test(raw)) return raw;
  return crypto.randomUUID();
}

function langCookieHeader(locale: Lang): string {
  return serializeCookie(LANG_COOKIE, locale, LANG_COOKIE_OPTS);
}

function redirectResponse(
  location: string,
  status: number,
  requestId: string,
  langCookie?: Lang,
): Response {
  const headers = new Headers({
    location,
    [REQUEST_ID_HEADER]: requestId,
  });
  for (const [name, value] of Object.entries(securityHeadersFor(location))) {
    headers.set(name, value);
  }
  if (langCookie) {
    headers.append("set-cookie", langCookieHeader(langCookie));
    headers.set("x-lang", langCookie);
  }
  return new Response(null, { status, headers });
}

export const proxyRequestMiddleware = createMiddleware({
  type: "request",
}).server(async ({ request, next, handlerType }) => {
  // Server-function RPC calls and the BFF (/api/*) bypass the page-level
  // proxy rules, mirroring the original matcher which excluded /api and
  // framework internals.
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (
    handlerType === "serverFn" ||
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_serverFn")
  ) {
    return next();
  }

  const { setResponseHeader, setCookie } =
    await import("@tanstack/react-start/server");

  // Global security headers (HSTS/nosniff/XFO/CSP/…) — the twin of
  // next.config.ts's headers() rules; see lib/security-headers.ts. The
  // /security/* branch below overwrites Content-Security-Policy with its
  // stricter nonce-based policy for that demo surface.
  for (const [name, value] of Object.entries(securityHeadersFor(pathname))) {
    setResponseHeader(name, value);
  }

  const requestId = parseRequestId(request);
  const requestCookies = parseCookieHeader(request.headers.get("cookie"));

  // Legacy redirect: /old-about → /about
  if (pathname === "/old-about") {
    return redirectResponse("/about", 308, requestId);
  }

  // i18n locale negotiation: a bare `/i18n` carries no locale segment, so
  // pick the best match from the lang cookie / Accept-Language and redirect
  // to `/i18n/{locale}`. 307 (not 308) because the target depends on request
  // headers and must not be cached.
  if (pathname === "/i18n" || pathname === "/i18n/") {
    const locale = resolveLocale(
      requestCookies.get(LANG_COOKIE),
      request.headers.get("accept-language"),
    );
    return redirectResponse(`/i18n/${locale}`, 307, requestId, locale);
  }

  // Reject an unsupported locale segment (e.g. /i18n/fr) with a
  // deterministic 404 before rendering.
  if (pathname.startsWith("/i18n/")) {
    const seg = pathname.split("/")[2];
    if (seg && !isLocale(seg)) {
      return new Response("Not Found", {
        status: 404,
        headers: { [REQUEST_ID_HEADER]: requestId },
      });
    }
  }

  // Versioned + localized app surface (/{version}/{lang}). Anything arriving
  // here is *redirected* to a sensible default, so a stale or hand-typed
  // version/lang always lands on a valid page.
  const firstSeg = pathname.split("/")[1] ?? "";
  if (isVersionLike(firstSeg)) {
    const [version, lang, ...rest] = pathname.split("/").filter(Boolean);

    // Unknown version (e.g. /v2) → default version, preserving the rest of
    // the path. 308: permanent canonicalization independent of headers.
    if (!isVersion(version)) {
      const target =
        "/" + [defaultVersion, lang, ...rest].filter(Boolean).join("/");
      return redirectResponse(target, 308, requestId);
    }

    // Known version, no locale segment → resolve from lang cookie then
    // Accept-Language. 307: depends on request headers, must not be cached.
    if (!lang) {
      const locale = resolveLocale(
        requestCookies.get(LANG_COOKIE),
        request.headers.get("accept-language"),
      );
      return redirectResponse(`/${version}/${locale}`, 307, requestId, locale);
    }

    // Known version, unsupported locale (e.g. /v1/fr) → default locale,
    // keeping the rest of the path.
    if (!isLocale(lang)) {
      const target = "/" + [version, defaultLocale, ...rest].join("/");
      return redirectResponse(target, 307, requestId, defaultLocale);
    }

    // Valid version + locale → require a session before rendering. Gating
    // here means an unauthenticated request never reaches a page at all.
    if (!requestCookies.get(ACCESS_TOKEN_COOKIE)) {
      return redirectResponse(LOGIN_PATH, 302, requestId);
    }
  }

  // Strict nonce-based CSP, scoped to /security/*. The nonce rides on the
  // request headers (the page reads it via headers()) and the CSP goes on
  // the response.
  if (pathname.startsWith("/security")) {
    const nonce = btoa(crypto.randomUUID());
    const csp = buildCsp(nonce);
    try {
      request.headers.set("x-nonce", nonce);
      request.headers.set("content-security-policy", csp);
    } catch {
      // Header guard may refuse mutation on some runtimes; the page falls
      // back to rendering without a nonce demo value.
    }
    setResponseHeader("Content-Security-Policy", csp);
    setResponseHeader("x-proxy", "active");
    setResponseHeader(REQUEST_ID_HEADER, requestId);
    return next();
  }

  // Dashboard protection: redirect to login if no access_token cookie is
  // present. Token validity is enforced by the backend guard; this is a
  // lightweight cookie-presence check only. (Ported from proxy.ts — this
  // block was missing from the initial port, leaving /dashboard reachable
  // logged-out on this app while Next.js gated it.)
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  ) {
    if (!requestCookies.get(ACCESS_TOKEN_COOKIE)) {
      return redirectResponse(LOGIN_PATH, 302, requestId);
    }
  }

  setResponseHeader("x-proxy", "active");
  setResponseHeader(REQUEST_ID_HEADER, requestId);

  // SSR cookie debug header — dev only, to avoid leaking auth-state.
  if (process.env.NODE_ENV !== "production") {
    setResponseHeader(
      "x-cookies-present",
      JSON.stringify({
        access_token: !!requestCookies.get(ACCESS_TOKEN_COOKIE),
        rbac_token: !!requestCookies.get(RBAC_TOKEN_COOKIE),
        device_token: !!requestCookies.get(DEVICE_TOKEN_COOKIE),
      }),
    );
  }

  // Ensure the lang cookie is present.
  const langCookie = requestCookies.get(LANG_COOKIE);
  const resolved = resolveLocale(
    langCookie,
    request.headers.get("accept-language"),
  );
  if (!langCookie) {
    setCookie(LANG_COOKIE, resolved, LANG_COOKIE_OPTS);
    setResponseHeader("x-lang", resolved);
  } else {
    setResponseHeader("x-lang", resolved);
  }

  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [proxyRequestMiddleware],
}));
