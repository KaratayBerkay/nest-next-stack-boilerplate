import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const RBAC_TOKEN_COOKIE = "rbac_token";
export const DEVICE_TOKEN_COOKIE = "device_token";
export const USER_TOKEN_COOKIE = "user_token";
export const SESSION_USER_COOKIE = "session_user";
/**
 * Determine the cookie Domain attribute. Priority:
 * 1. Explicit COOKIE_DOMAIN env var (e.g. ".eys.gen.tr")
 * 2. Derive from NEXT_PUBLIC_APP_URL (e.g. "https://app.eys.gen.tr" → ".eys.gen.tr")
 * 3. localhost / IP → undefined (host-only)
 *
 * This lets every subdomain (app, api, admin, …) share auth cookies without
 * needing a separate env var on the frontend deployment.
 */
function cookieDomain(): string | undefined {
  if (process.env.COOKIE_DOMAIN) return process.env.COOKIE_DOMAIN;

  const publicUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (publicUrl) {
    try {
      const hostname = new URL(publicUrl).hostname;
      if (hostname === "localhost" || /^[\d.]+$/.test(hostname)) {
        return undefined;
      }
      const parts = hostname.split(".");
      // "app.eys.gen.tr" → [app, eys, gen, tr] → ".eys.gen.tr"
      if (parts.length >= 3) {
        return "." + parts.slice(1).join(".");
      }
      // "example.com" → ".example.com"
      if (parts.length === 2) {
        return "." + hostname;
      }
    } catch {
      /* invalid URL - fall through to undefined */
    }
  }
  return undefined;
}

function baseOptions(overrides: Partial<ResponseCookie>): ResponseCookie {
  return {
    name: "",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAMESITE === "none" ? "none" : "lax",
    path: "/",
    domain: cookieDomain(),
    // High priority: browser evicts low/medium priority cookies first when
    // the per-domain cookie limit is reached. Auth tokens must not be evicted.
    priority: "high",
    ...overrides,
  };
}

export function accessTokenCookieOptions(
  value: string,
  maxAge?: number,
): ResponseCookie {
  return baseOptions({
    name: ACCESS_TOKEN_COOKIE,
    value,
    maxAge: maxAge ?? 60 * 15,
  });
}

export function clearAccessTokenCookieOptions(): ResponseCookie {
  return baseOptions({
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    maxAge: 0,
  });
}

export function deviceTokenCookieOptions(
  value: string,
  maxAge?: number,
): ResponseCookie {
  return baseOptions({
    name: DEVICE_TOKEN_COOKIE,
    value,
    maxAge: maxAge ?? 60 * 60 * 24 * 365,
  });
}

export function clearDeviceCookieOptions(): ResponseCookie {
  return baseOptions({
    name: DEVICE_TOKEN_COOKIE,
    value: "",
    maxAge: 0,
  });
}

export function rbacTokenCookieOptions(
  value: string,
  maxAge?: number,
): ResponseCookie {
  return baseOptions({
    name: RBAC_TOKEN_COOKIE,
    value,
    maxAge: maxAge ?? 60 * 15,
  });
}

export function clearRbacTokenCookieOptions(): ResponseCookie {
  return baseOptions({
    name: RBAC_TOKEN_COOKIE,
    value: "",
    maxAge: 0,
  });
}

export function userTokenCookieOptions(
  value: string,
  maxAge?: number,
): ResponseCookie {
  return baseOptions({
    name: USER_TOKEN_COOKIE,
    value,
    maxAge: maxAge ?? 60 * 15,
  });
}

export function clearUserTokenCookieOptions(): ResponseCookie {
  return baseOptions({
    name: USER_TOKEN_COOKIE,
    value: "",
    maxAge: 0,
  });
}

export function sessionUserCookieOptions(
  value: string,
  maxAge?: number,
): ResponseCookie {
  return baseOptions({
    name: SESSION_USER_COOKIE,
    value,
    maxAge: maxAge ?? 60 * 15,
  });
}

export function clearSessionUserCookieOptions(): ResponseCookie {
  return baseOptions({
    name: SESSION_USER_COOKIE,
    value: "",
    maxAge: 0,
  });
}
