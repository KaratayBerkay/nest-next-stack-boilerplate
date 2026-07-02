import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import {
  isProduction,
  secureCookieOptions,
} from '../common/cookies/cookie.factory';

const RBAC_TTL_MS = 1000 * 60 * 15; // 15m — mirrors JWT_ACCESS_TTL default

export { isProduction };

export function rbacCookieName(config: ConfigService): string {
  return isProduction(config) ? '__Secure-rbac_token' : 'rbac_token';
}

export function rbacCookieOptions(
  config: ConfigService,
  overrides: Partial<CookieOptions> = {},
): CookieOptions {
  return secureCookieOptions(config, { maxAge: RBAC_TTL_MS, ...overrides });
}
