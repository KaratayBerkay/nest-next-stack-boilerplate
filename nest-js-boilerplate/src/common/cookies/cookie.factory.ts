import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';

// Single source of truth for cookie hardening — keyed on NODE_ENV so the SAME options apply
// everywhere (device-token, refresh-token, access-token, CSRF, …) instead of each feature
// hand-rolling its own.
// Policy:
//   dev (http://localhost):     Secure=false -> works on plain http
//   prod (https):               Secure=true  -> https only
//   Domain (both):              COOKIE_DOMAIN when set (e.g. ".eys.gen.tr")  -> shared across
//                              subdomains; omit domain for host-only cookies (more restrictive).
//   SameSite from COOKIE_SAMESITE (default 'lax').
export function isProduction(config: ConfigService): boolean {
  return config.get<string>('NODE_ENV') === 'production';
}

/**
 * Base hardened cookie options. `overrides` lets a caller add `maxAge`/`signed`/etc. without
 * re-deciding the security-relevant fields (httpOnly/secure/sameSite/domain/path).
 *
 * Domain is applied whenever COOKIE_DOMAIN is set (any env), so subdomain sharing like
 * `.eys.gen.tr` works in dev too. When unset the cookie is host-only (more restrictive).
 */
export function secureCookieOptions(
  config: ConfigService,
  overrides: Partial<CookieOptions> = {},
): CookieOptions {
  const prod = isProduction(config);
  return {
    httpOnly: true,
    secure: prod,
    // 'lax' is fine across same-site subdomains (api.example.com <-> app.example.com). Set
    // COOKIE_SAMESITE=none (with Secure) only if the frontend is a truly cross-site origin.
    sameSite: config.get<CookieOptions['sameSite']>('COOKIE_SAMESITE') ?? 'lax',
    domain: config.get<string>('COOKIE_DOMAIN') || undefined,
    path: '/',
    // High priority reduces the chance the browser evicts auth tokens under the
    // per-domain cookie limit.
    priority: 'high',
    ...overrides,
  };
}

/**
 * Browser-enforced security prefix in prod. `__Secure-` requires the cookie be Secure (Domain is
 * still allowed, unlike `__Host-`). Dev keeps the plain `base` name so http://localhost works.
 * Read and write MUST use the same name, so always derive it from this helper.
 */
export function secureCookieName(base: string, config: ConfigService): string {
  return isProduction(config) ? `__Secure-${base}` : base;
}
