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
  // The token is HMAC-bound to this id. In a real app return the authenticated session id;
  // here we fall back to the client IP so issue + verify line up within a session.
  getSessionIdentifier: (req) => req.ip ?? 'anonymous',
  // `__Host-` requires Secure+path=/ (HTTPS only) — use a plain name off production.
  cookieName: isProd ? '__Host-csrf' : 'csrf-token',
  cookieOptions: { sameSite: 'lax', path: '/', secure: isProd },
});

export const generateCsrfToken = csrf.generateCsrfToken;
export const doubleCsrfProtection = csrf.doubleCsrfProtection;
// Boolean check (cookie + `x-csrf-token` header HMAC match) used by CsrfGuard to protect the
// cookie-driven GraphQL mutations, where route-level middleware can't isolate one operation.
export const validateRequest = csrf.validateRequest;
