import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import {
  isProduction,
  secureCookieOptions,
} from '../common/cookies/cookie.factory';

// The access-token cookie carries the short-lived JWT.  Security-relevant options come
// from the shared cookie factory (httpOnly, Secure-by-env, SameSite, Domain); only the
// name and the short max-age are access-specific.
// dev name `access_token`, prod name `__Secure-access_token`.
const ACCESS_TTL_MS = 1000 * 60 * 15; // 15m — mirrors JWT_ACCESS_TTL default

export { isProduction };

/**
 * DI-free half of {@link accessCookieName} — split out so a caller that
 * already knows whether it's in prod (e.g. csrf.middleware.ts, which
 * computes its own `isProd` from `process.env` at module scope because a
 * ConfigService instance isn't available there) can derive the exact same
 * name instead of re-hardcoding the two literal strings. That duplication is
 * exactly how they drifted apart once already: csrf.middleware.ts's copy
 * checked for `__Host-access_token`, which never matches the real
 * `__Secure-access_token` cookie this function has always produced in prod.
 */
export function accessCookieNameForEnv(isProd: boolean): string {
  return isProd ? '__Secure-access_token' : 'access_token';
}

export function accessCookieName(config: ConfigService): string {
  return accessCookieNameForEnv(isProduction(config));
}

export function accessCookieOptions(
  config: ConfigService,
  overrides: Partial<CookieOptions> = {},
): CookieOptions {
  return secureCookieOptions(config, { maxAge: ACCESS_TTL_MS, ...overrides });
}
