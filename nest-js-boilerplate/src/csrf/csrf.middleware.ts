import { doubleCsrf } from 'csrf-csrf';

// Double-submit-cookie CSRF (the `csrf-csrf` package the NestJS docs recommend now that
// `csurf` is deprecated). v4 renamed the docs' `generateToken` -> `generateCsrfToken` and
// made getSecret + getSessionIdentifier required.
const isProd = process.env.NODE_ENV === 'production';

// Only re-export the two helpers we use. Exporting `invalidCsrfTokenError` would leak the
// HttpError type from the transitive @types/http-errors and trip TS4023 under declaration:true.
const csrf = doubleCsrf({
  getSecret: () => {
    const secret = process.env.CSRF_SECRET;
    if (!secret) throw new Error('CSRF_SECRET is not set');
    return secret;
  },
  // Bind the HMAC to the authenticated session's access_token cookie rather than the
  // client IP. This avoids shared-NAT collisions and mobile IP-change breakage.
  getSessionIdentifier: (req) => {
    const cookies = (req as unknown as Record<string, unknown>).cookies as
      Record<string, string> | undefined;
    // cookie name is set by the app (access_token or __Host-access_token).
    // Fall back to the raw header for non-cookie clients.
    const authHeader = req.headers?.authorization;
    const bearer = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;
    return (
      cookies?.['access_token'] ??
      cookies?.['__Host-access_token'] ??
      bearer ??
      req.ip ??
      'anonymous'
    );
  },
  // `__Host-` requires Secure+path=/ (HTTPS only) — use a plain name off production.
  cookieName: isProd ? '__Host-csrf' : 'csrf-token',
  cookieOptions: { sameSite: 'lax', path: '/', secure: isProd },
});

export const generateCsrfToken = csrf.generateCsrfToken;
export const doubleCsrfProtection = csrf.doubleCsrfProtection;
// Boolean check (cookie + `x-csrf-token` header HMAC match) used by CsrfGuard to protect the
// cookie-driven GraphQL mutations, where route-level middleware can't isolate one operation.
export const validateRequest = csrf.validateRequest;
