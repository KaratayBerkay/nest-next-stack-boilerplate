import { ConfigService } from '@nestjs/config';
import {
  isProduction,
  secureCookieName,
  secureCookieOptions,
} from './cookie.factory';

// Proves the secure-by-env cookie policy (TODO workstream 3): the SAME factory yields relaxed
// options on dev (http://localhost) and hardened ones in prod (https) — no per-feature ad-hoc
// options. A tiny ConfigService stub stands in for env so no app/DB is needed.
const stubConfig = (env: Record<string, string | undefined>): ConfigService =>
  ({ get: <T>(key: string): T => env[key] as unknown as T }) as ConfigService;

describe('cookie.factory (secure-by-env)', () => {
  describe('development', () => {
    const config = stubConfig({ NODE_ENV: 'development' });

    it('is not production', () => {
      expect(isProduction(config)).toBe(false);
    });

    it('builds an httpOnly, NON-Secure cookie with no Domain when COOKIE_DOMAIN unset', () => {
      const opts = secureCookieOptions(config);
      expect(opts.httpOnly).toBe(true);
      expect(opts.secure).toBe(false); // http://localhost must work
      expect(opts.sameSite).toBe('lax'); // default
      expect(opts.domain).toBeUndefined(); // no domain by default
      expect(opts.path).toBe('/');
    });

    it('applies domain when COOKIE_DOMAIN is set (even in dev)', () => {
      const cfg = stubConfig({
        NODE_ENV: 'development',
        COOKIE_DOMAIN: '.eys.gen.tr',
      });
      const opts = secureCookieOptions(cfg);
      expect(opts.domain).toBe('.eys.gen.tr');
      expect(opts.secure).toBe(false); // still non-Secure in dev
    });

    it('treats empty COOKIE_DOMAIN as undefined (host-only)', () => {
      const opts = secureCookieOptions(
        stubConfig({ NODE_ENV: 'development', COOKIE_DOMAIN: '' }),
      );
      expect(opts.domain).toBeUndefined();
    });

    it('keeps the plain cookie name (no __Secure- prefix)', () => {
      expect(secureCookieName('refresh_token', config)).toBe('refresh_token');
    });
  });

  describe('production', () => {
    const config = stubConfig({
      NODE_ENV: 'production',
      COOKIE_DOMAIN: '.example.com',
      COOKIE_SAMESITE: 'none',
    });

    it('is production', () => {
      expect(isProduction(config)).toBe(true);
    });

    it('builds a Secure cookie carrying Domain + the configured SameSite', () => {
      const opts = secureCookieOptions(config);
      expect(opts.httpOnly).toBe(true);
      expect(opts.secure).toBe(true); // https only
      expect(opts.sameSite).toBe('none'); // from COOKIE_SAMESITE (cross-site SSR)
      expect(opts.domain).toBe('.example.com');
      expect(opts.path).toBe('/');
    });

    it('applies the browser-enforced __Secure- name prefix', () => {
      expect(secureCookieName('refresh_token', config)).toBe(
        '__Secure-refresh_token',
      );
    });

    it('lets callers add fields (maxAge) without re-deciding security options', () => {
      const opts = secureCookieOptions(config, { maxAge: 1234 });
      expect(opts.maxAge).toBe(1234);
      expect(opts.secure).toBe(true);
    });
  });
});
