import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { ACCESS_TOKEN_COOKIE, DEVICE_TOKEN_COOKIE, RBAC_TOKEN_COOKIE } from "@/lib/cookie";
import { defaultLocale, isLocale, resolveLocale } from "@/lib/i18n/config";
import { defaultVersion, isVersion, isVersionLike } from "@/lib/version/config";
import { LANG_COOKIE } from "@/constants/i18n";
import type { Lang } from "@/constants/i18n";

const LANG_COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

/**
 * Builds a strict, nonce-based Content-Security-Policy (per the Next.js CSP guide).
 * `'strict-dynamic'` + a per-request nonce means only the scripts Next.js tags with
 * this nonce may run — no `'unsafe-inline'`. In dev, React needs `'unsafe-eval'`.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`};
    img-src 'self' blob: data:;
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

function setLangCookie(response: NextResponse, locale: Lang): void {
  response.cookies.set(LANG_COOKIE, locale, LANG_COOKIE_OPTS);
  response.headers.set("x-lang", locale);
}

const REQUEST_ID_HEADER = "x-request-id";
const CORRELATION_ID_HEADER = "x-correlation-id";

function withRequestId(res: NextResponse, requestId: string): NextResponse {
  res.headers.set(REQUEST_ID_HEADER, requestId);
  return res;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId =
    request.headers.get(REQUEST_ID_HEADER) ??
    request.headers.get(CORRELATION_ID_HEADER) ??
    randomUUID();

  // Legacy redirect: /old-about → /about
  if (pathname === "/old-about") {
    const url = request.nextUrl.clone();
    url.pathname = "/about";
    return withRequestId(NextResponse.redirect(url, 308), requestId);
  }

  // i18n locale negotiation (Next.js Internationalization guide): a bare `/i18n`
  // carries no locale segment, so pick the best match from `Accept-Language` and
  // redirect to `/i18n/{locale}`. 307 (not 308) because the target depends on the
  // request's headers and must not be cached. Scoped to the /i18n demo so the rest
  // of the app stays un-prefixed.
  if (pathname === "/i18n" || pathname === "/i18n/") {
    const locale = resolveLocale(
      request.cookies.get(LANG_COOKIE)?.value,
      request.headers.get("accept-language"),
    );
    const url = request.nextUrl.clone();
    url.pathname = `/i18n/${locale}`;
    const redirect = NextResponse.redirect(url, 307);
    setLangCookie(redirect, locale);
    return withRequestId(redirect, requestId);
  }

  // Reject an unsupported locale segment (e.g. /i18n/fr) with a deterministic 404
  // here, before rendering. Doing it in the page via `notFound()` is unreliable
  // under `cacheComponents`: the static shell flushes a 200 before the streamed
  // Suspense hole can change the status. (`dynamicParams = false`, the docs' gate,
  // is itself rejected by `cacheComponents` — see docs gotcha #18.)
  if (pathname.startsWith("/i18n/")) {
    const seg = pathname.split("/")[2];
    if (seg && !isLocale(seg)) {
      return withRequestId(
        new NextResponse("Not Found", { status: 404 }),
        requestId,
      );
    }
  }

  // Versioned + localized app surface (/{version}/{lang}). Unlike the /i18n demo
  // above — which 404s an unknown locale — anything arriving here is *redirected*
  // to a sensible default, so a stale or hand-typed version/lang always lands on a
  // valid page. Gating in the proxy (not the page) is what makes this deterministic
  // under `cacheComponents` (see docs gotcha #18).
  const firstSeg = pathname.split("/")[1] ?? "";
  if (isVersionLike(firstSeg)) {
    const [version, lang, ...rest] = pathname.split("/").filter(Boolean);
    const url = request.nextUrl.clone();

    // Unknown version (e.g. /v2) → default version, preserving the rest of the
    // path. 308: a permanent canonicalization that doesn't depend on headers.
    if (!isVersion(version)) {
      url.pathname =
        "/" + [defaultVersion, lang, ...rest].filter(Boolean).join("/");
      return withRequestId(NextResponse.redirect(url, 308), requestId);
    }

    // Known version, no locale segment → resolve from lang cookie then Accept-Language.
    // 307: the target depends on request headers and must not be cached.
    if (!lang) {
      const locale = resolveLocale(
        request.cookies.get(LANG_COOKIE)?.value,
        request.headers.get("accept-language"),
      );
      url.pathname = `/${version}/${locale}`;
      const redirect = NextResponse.redirect(url, 307);
      setLangCookie(redirect, locale);
      return withRequestId(redirect, requestId);
    }

    // Known version, unsupported locale (e.g. /v1/fr) → default locale, keeping
    // the rest of the path. 307 to match the negotiation redirect above.
    if (!isLocale(lang)) {
      url.pathname = "/" + [version, defaultLocale, ...rest].join("/");
      const redirect = NextResponse.redirect(url, 307);
      setLangCookie(redirect, defaultLocale);
      return withRequestId(redirect, requestId);
    }

    // Valid version + locale → fall through and render.
  }

  // Strict nonce-based CSP, scoped to /security/*. A fresh nonce per request forces
  // dynamic rendering, which is incompatible with the app-wide `cacheComponents: true`
  // (PPR) — a static shell can't carry a per-request nonce. So we scope it to routes
  // that opt into dynamic rendering (they read the nonce via `headers()`), keeping the
  // rest of the app statically optimized. See docs/frontend/progress for the logged gotcha.
  if (pathname.startsWith("/security")) {
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const csp = buildCsp(nonce);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("x-proxy", "active");
    return withRequestId(response, requestId);
  }

  const res = NextResponse.next();

  res.headers.set("x-proxy", "active");

  // SSR cookie debug header
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const rbacToken = request.cookies.get(RBAC_TOKEN_COOKIE)?.value;
  const deviceToken = request.cookies.get(DEVICE_TOKEN_COOKIE)?.value;
  res.headers.set(
    "x-cookies-present",
    JSON.stringify({
      access_token: !!accessToken,
      rbac_token: !!rbacToken,
      device_token: !!deviceToken,
    }),
  );

  // Ensure lang cookie is present
  const langCookie = request.cookies.get(LANG_COOKIE)?.value;
  const resolved = resolveLocale(
    langCookie,
    request.headers.get("accept-language"),
  );
  if (!langCookie) {
    setLangCookie(res, resolved);
  } else {
    res.headers.set("x-lang", resolved);
  }

  return withRequestId(res, requestId);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
