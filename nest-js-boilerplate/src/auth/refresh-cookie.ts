import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import {
  isProduction,
  secureCookieOptions,
} from '../common/cookies/cookie.factory';

const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export { isProduction };

export function refreshCookieName(config: ConfigService): string {
  return isProduction(config) ? '__Secure-refresh_token' : 'refresh_token';
}

export function refreshCookieOptions(
  config: ConfigService,
  overrides: Partial<CookieOptions> = {},
): CookieOptions {
  return secureCookieOptions(config, { maxAge: REFRESH_TTL_MS, ...overrides });
}
