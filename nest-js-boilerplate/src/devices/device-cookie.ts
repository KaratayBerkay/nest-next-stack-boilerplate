import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import {
  isProduction,
  secureCookieOptions,
} from '../common/cookies/cookie.factory';

// The device-token cookie holds a server-issued device id (UUID). Security-relevant options come
// from the shared cookie factory (httpOnly, Secure-by-env, SameSite, Domain); only the name and
// the long max-age are device-specific. dev name `device_token`, prod name `__Secure-device`
// (the `__Secure-` prefix is browser-enforced: the cookie MUST be Secure, Domain still allowed).
// Read/write must use the SAME name, hence both derive from env here.
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export { isProduction };

export function deviceCookieName(config: ConfigService): string {
  return isProduction(config) ? '__Secure-device' : 'device_token';
}

export function deviceCookieOptions(config: ConfigService): CookieOptions {
  return secureCookieOptions(config, { maxAge: ONE_YEAR_MS });
}
