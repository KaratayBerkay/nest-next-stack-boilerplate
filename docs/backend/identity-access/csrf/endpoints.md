# CSRF — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/csrf/`](../../../../nest-js-boilerplate/src/csrf/)

## REST

Base path: `/csrf` (`@Controller('csrf')`, no `/api` prefix).

### Get a CSRF token

**Kind:** REST · **`GET /csrf/token`**
**Source:** [`csrf.controller.ts#L9-15`](../../../../nest-js-boilerplate/src/csrf/csrf.controller.ts)
**Auth:** none required — `GET` is an ignored method under `doubleCsrf`'s defaults, so this route
itself isn't CSRF-blocked (it's how a caller *obtains* the token in the first place).
**Response:** `{ token: string }` — also sets the `csrf-token`/`__Host-csrf` cookie via
`generateCsrfToken(req, res)`.
**Used by:** every BFF/mobile call site that needs to perform a cookie-driven mutation the backend
CSRF-guards — see [README.md § Used by](./README.md#used-by) for the concrete list (frontend's
`csrfEchoHeaders()`, mobile's `refresh_token.dart`).

### Echo CSRF-protected body (test endpoint)

**Kind:** REST · **`POST /csrf/echo`**
**Source:** [`csrf.controller.ts#L18-21`](../../../../nest-js-boilerplate/src/csrf/csrf.controller.ts)
**Auth:** `doubleCsrfProtection` middleware (module-wide, via `CsrfModule.configure()`) — a mutating
method, so it **is** blocked without a valid `x-csrf-token` header matching the `csrf-token` cookie.
**Request:** any JSON body.
**Response:** `{ received: <the same body> }`.
**Errors:** `403` — invalid or missing CSRF token · `404` when `NODE_ENV=production` (`BE-009`,
resolved 2026-09-03 — the route is a test fixture, not a product contract, so it no longer exists
outside test/development).
**Used by:** `test/csrf.e2e-spec.ts` only — the e2e proof that the middleware 403s a write without
a token and lets one through with it. No frontend or mobile caller; see
[README.md § Known issues](./README.md#known-issues).
