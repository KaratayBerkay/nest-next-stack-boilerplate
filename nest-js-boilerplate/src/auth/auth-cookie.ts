import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import {
  isProduction,
  secureCookieOptions,
} from '../common/cookies/cookie.factory';

// The refresh-token cookie carries the opaque Session token (the same value AuthPayload returns in
// the body for API-only clients). Browser/SSR clients use this httpOnly cookie instead, so the
// refresh token is never readable by page JS. Security options come from the shared factory; only
// the name and the 30-day max-age (kept in sync with REFRESH_TTL_MS) are refresh-specific.
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30d — mirrors auth.service REFRESH_TTL_MS

export function refreshCookieName(config: ConfigService): string {
  return isProduction(config) ? '__Secure-refresh_token' : 'refresh_token';
}

export function refreshCookieOptions(config: ConfigService): CookieOptions {
  return secureCookieOptions(config, { maxAge: REFRESH_TTL_MS });
}
