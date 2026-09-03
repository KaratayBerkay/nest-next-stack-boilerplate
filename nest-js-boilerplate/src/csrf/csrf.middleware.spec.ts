import type { Request, Response } from 'express';

type CsrfModule = typeof import('./csrf.middleware');

/**
 * Regression coverage for the getSessionIdentifier cookie-name bug: in
 * production, the session identifier used to silently fall back to req.ip
 * (neither of its two hardcoded cookie-name guesses ever matched the real
 * `__Secure-access_token` cookie), so two different sessions sharing one IP
 * could pass each other's CSRF token. This loads the module fresh under
 * NODE_ENV=production (mirroring the real prod cookie name) since isProd is
 * captured at module-load time.
 */
describe('csrf.middleware getSessionIdentifier binding (production)', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
  const ORIGINAL_CSRF_SECRET = process.env.CSRF_SECRET;

  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
    process.env.CSRF_SECRET = ORIGINAL_CSRF_SECRET;
    jest.resetModules();
  });

  function loadProdCsrfModule(): CsrfModule {
    jest.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.CSRF_SECRET = 'test-csrf-secret-at-least-16-chars-long';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./csrf.middleware') as CsrfModule;
  }

  function mockReqRes(accessToken: string, ip: string) {
    const cookies: Record<string, string> = {
      '__Secure-access_token': accessToken,
    };
    const headers: Record<string, string> = {};
    const req = { cookies, headers, ip } as unknown as Request;
    const cookieCalls: Array<[string, string]> = [];
    const res = {
      cookie: jest.fn((name: string, value: string) => {
        cookieCalls.push([name, value]);
        cookies[name] = value;
      }),
    } as unknown as Response;
    return { req, res, cookieCalls };
  }

  it('rejects a CSRF pair minted for one access_token when replayed under a different one on the same IP', () => {
    const { generateCsrfToken, validateRequest } = loadProdCsrfModule();

    const sessionA = mockReqRes('session-A-access-token', '203.0.113.9');
    const token = generateCsrfToken(sessionA.req, sessionA.res);
    sessionA.req.headers['x-csrf-token'] = token;
    expect(validateRequest(sessionA.req)).toBe(true);

    // Same IP, same minted CSRF cookie + header token, but a DIFFERENT
    // access_token cookie (a different authenticated session). Under the
    // pre-fix bug, getSessionIdentifier never found `__Secure-access_token`
    // and fell back to req.ip — identical for both requests here — so this
    // would have incorrectly validated.
    const sessionB = mockReqRes('session-B-access-token', '203.0.113.9');
    const [csrfCookieName, csrfCookieValue] = sessionA.cookieCalls[0];
    sessionB.req.cookies[csrfCookieName] = csrfCookieValue;
    sessionB.req.headers['x-csrf-token'] = token;

    expect(validateRequest(sessionB.req)).toBe(false);
  });

  it('accepts the same access_token cookie replaying its own CSRF pair', () => {
    const { generateCsrfToken, validateRequest } = loadProdCsrfModule();

    const session = mockReqRes('session-C-access-token', '198.51.100.4');
    const token = generateCsrfToken(session.req, session.res);
    session.req.headers['x-csrf-token'] = token;

    expect(validateRequest(session.req)).toBe(true);
  });
});
