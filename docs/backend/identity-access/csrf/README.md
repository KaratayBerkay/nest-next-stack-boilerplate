# CSRF (backend)

**Source:** [`nest-js-boilerplate/src/csrf/`](../../../../nest-js-boilerplate/src/csrf/) ·
**Category:** [Identity & Access](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

Double-submit-cookie CSRF protection (via the `csrf-csrf` package — the NestJS docs' recommended
replacement for the deprecated `csurf`). This module has a real controller (two routes), which is why
it gets an `endpoints.md` despite having **no dedicated frontend/mobile page of its own** — it's
platform infrastructure, consumed from inside other modules' mutation handlers, not something a user
navigates to. Wired into `app.module.ts`'s `CORE_MODULES` directly. See
[`csrf.module.ts`](../../../../nest-js-boilerplate/src/csrf/csrf.module.ts).

## Why this exists alongside bearer-token auth

CSRF only matters for the **cookie-authenticated** surface — a request whose credentials the browser
attaches automatically. Bearer-token traffic (`Authorization: Bearer <access_token>`, or an API key)
isn't auto-attached by the browser to a cross-site request, so it doesn't need this. That's why CSRF
protection here is applied **per-guard, not globally**:

- [`CsrfGuard`](../../../../nest-js-boilerplate/src/csrf/csrf.guard.ts) is a `CanActivate`, not route
  middleware — because GraphQL is a single `POST /graphql` endpoint, middleware on the route would
  block *every* query and bearer-authed mutation alike. Applying it as a guard lets it be composed only
  onto the specific cookie-driven mutations that actually rely on the ambient httpOnly session cookie
  (the source comment names `refresh`/`logout` as the exact CSRF-sensitive surface — those two don't
  carry the CSRF-checked `sessionId` claim a normal `SessionAuthGuard`-protected mutation gets, so they
  need their own explicit guard).
- The **general** case — every other cookie-authenticated GraphQL mutation — doesn't use `CsrfGuard`
  at all. It's covered by [`SessionAuthGuard`'s own step 10](../auth/README.md#sessionauthguard--validation-order):
  CSRF-checked *only* for GraphQL mutations, *only* when auth came via cookie rather than
  `Authorization: Bearer`. `CsrfGuard` and that `SessionAuthGuard` step both end up calling the same
  underlying `validateRequest` from `csrf.middleware.ts` — two call sites, one validation function, not
  a duplicated CSRF implementation.

## Double-submit mechanics

[`csrf.middleware.ts`](../../../../nest-js-boilerplate/src/csrf/csrf.middleware.ts) configures
`doubleCsrf` with the HMAC bound to the **session identifier** (the `access_token`/`__Host-access_token`
cookie value, falling back to a bearer token or `req.ip`) rather than the client IP — avoiding false
CSRF failures behind shared-NAT networks or mobile IP changes, at the cost of the check being
session-scoped rather than connection-scoped. Cookie name: `csrf-token` (dev) / `__Host-csrf` (prod,
`__Host-` requires `Secure` + `path=/`, HTTPS-only). Client flow: `GET /csrf/token` (an ignored/
unblocked method under `doubleCsrf`'s defaults) sets the cookie and returns the token; the client echoes
it back in the `x-csrf-token` header on the next write.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| REST controller | [`csrf.controller.ts`](../../../../nest-js-boilerplate/src/csrf/csrf.controller.ts) | [endpoints.md](./endpoints.md) |

`CsrfGuard` is also consumed directly by other modules' `@UseGuards()` (not just this controller) —
see [identity-access/auth/endpoints.md § Refresh the session](../auth/endpoints.md#refresh-the-session)
and [§ Log out](../auth/endpoints.md#log-out) for the two `refresh`/`logout` mutation call sites.

## Depends on

Nothing beyond `cookie-parser` (applied ahead of `doubleCsrfProtection` in this module's own
`configure()`, since the CSRF cookie must be parseable before the middleware runs).

## Used by

Not a page — referenced from other modules' mutation handlers and their frontend/mobile BFF layers.
`GET /csrf/token` specifically is called from **every** BFF mutation route in this vertical that needs
to echo a CSRF header to the backend:
[`lib/backend.ts`'s `csrfEchoHeaders()`](../../../../next-js-boilerplate/src/lib/backend.ts) (a
5-second-cached, per-session helper — not re-fetched on every single mutation) is the one call site;
every settings mutation route (`revoke session`, `revoke API key`, `create API key`, …) calls through
it. See
[settings/sessions api.md](../../../frontend/v1/settings/sessions/api.md) and
[settings/api-keys api.md](../../../frontend/v1/settings/api-keys/api.md) for concrete examples of BFF
routes that depend on this. Mobile mostly doesn't need it — Flutter forwards session tokens as explicit headers rather than
relying on ambient browser cookies, so the double-submit pattern's threat model doesn't generally
apply — **except for one call site**: `refresh_token.dart`'s `_fetchCsrfHeaders()`
([`api/server/auth/refresh_token.dart#L25-48`](../../../../flutter-boilerplate/lib/api/server/auth/refresh_token.dart))
fetches `GET /csrf/token` and echoes it back on the `refreshToken` GraphQL mutation — the same
`refresh`/`logout`-only `CsrfGuard` surface this module's own doc comment calls out (see
[above](#why-this-exists-alongside-bearer-token-auth)), confirming that guard really is applied
regardless of client platform, not just to defend the browser's cookie flow. See
[mobile auth/api.md § Shape per file](../../../mobile/auth/api.md#shape-per-file) (the
`refresh_token.dart` row) for that file's own documentation — noted here only to correct an initial
assumption this doc almost shipped with (mobile "shouldn't" need CSRF headers by the general
threat-model argument above, but this one endpoint is guarded server-side regardless of caller, so it
does).

## Known issues

- `POST /csrf/echo` (a self-test endpoint — echoes the request body back once CSRF-validated) has no
  caller anywhere in either frontend or mobile source (confirmed: the only `/api/echo`-shaped route on
  web is an unrelated CSR demo page, `views/demos/csr/PageContent.tsx`, hitting a completely different
  backend endpoint). Looks like a manual-testing utility route rather than a real contract — low
  severity, but logged as [BE-009](../../../issues.md#be-009) since an unused-but-live endpoint is
  exactly the kind of thing worth a second look before assuming it's intentional.
