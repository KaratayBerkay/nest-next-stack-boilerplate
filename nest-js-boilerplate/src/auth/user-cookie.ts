import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import {
  isProduction,
  secureCookieOptions,
} from '../common/cookies/cookie.factory';

const USER_TTL_MS = 1000 * 60 * 15; // 15m — mirrors JWT_ACCESS_TTL default

export { isProduction };

export function userCookieName(config: ConfigService): string {
  return isProduction(config) ? '__Secure-user_token' : 'user_token';
}

export function userCookieOptions(
  config: ConfigService,
  overrides: Partial<CookieOptions> = {},
): CookieOptions {
  return secureCookieOptions(config, { maxAge: USER_TTL_MS, ...overrides });
}
