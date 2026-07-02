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

export function accessCookieName(config: ConfigService): string {
  return isProduction(config) ? '__Secure-access_token' : 'access_token';
}

export function accessCookieOptions(
  config: ConfigService,
  overrides: Partial<CookieOptions> = {},
): CookieOptions {
  return secureCookieOptions(config, { maxAge: ACCESS_TTL_MS, ...overrides });
}
