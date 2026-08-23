# common/cookies (backend)

**Source:** [`nest-js-boilerplate/src/common/cookies/`](../../../../../nest-js-boilerplate/src/common/cookies/) ·
**Category:** [Platform / Core](../../README.md) · **Parent:** [common](../README.md)

> **Read this before trusting the name:** there is a second, unrelated `cookies/` directory at
> `nest-js-boilerplate/src/cookies/` — a demo-gated (`DEMO_MODULES`) NestJS cookie-recipe module
> (`CookiesController`, groups endpoints that read/write a demo cookie). It has nothing to do with this
> real, always-on directory. See
> [_reference/excluded-modules.md#cookies](../../../_reference/excluded-modules.md#cookies) — the
> fourth confirmed name-collision trap in this codebase, alongside `users/`↔`profile/`
> ([BE-002](../../../../issues.md#be-002)), `session/`↔`sessions/`, and `tasks/`↔`project-tasks/`.

## What this owns

One file, [`cookie.factory.ts`](../../../../../nest-js-boilerplate/src/common/cookies/cookie.factory.ts),
the single source of truth for cookie-hardening options — so every cookie the app sets (access,
refresh, rbac, device, user, CSRF) gets the same security posture instead of each feature hand-rolling
its own `CookieOptions`. Two exports:

- **`secureCookieOptions(config, overrides?)`** — always `httpOnly: true`; `secure` follows
  `NODE_ENV === 'production'` (so plain `http://localhost` still works in dev); `sameSite` from
  `COOKIE_SAMESITE` (default `'lax'`); `domain` from `COOKIE_DOMAIN` when set (the file's own comment
  gives `.eys.gen.tr` as the worked example, for subdomain sharing) or host-only (more restrictive)
  when unset; `priority: 'high'` to reduce eviction risk under the browser's per-domain cookie-count
  limit.
- **`secureCookieName(base, config)`** — prepends the browser-enforced `__Secure-` prefix in
  production only (dev keeps the plain name so `http://localhost` — which can't satisfy `__Secure-`'s
  Secure-attribute requirement — still works). Read and write call sites must both derive the name from
  this same function or a cookie set under one name would never be found under the other.

## Interfaces

None. Internal-only — two plain exported functions, no DI, no module wrapper.

## Depends on

Nothing backend-internal — reads `ConfigService` directly.

## Used by (who imports this, and why)

Confirmed via grep — every real cookie name factory in the app builds on this: `auth/access-cookie.ts`,
`auth/refresh-cookie.ts`, `auth/rbac-cookie.ts`, `auth/user-cookie.ts` (the four session cookies — see
[identity-access/auth](../../../identity-access/auth/README.md) for the concrete model this backs), and
`devices/device-cookie.ts` (the device-token cookie — see
[identity-access/devices](../../../identity-access/devices/README.md)). Any future cookie-setting
feature should use this factory rather than reinventing cookie-hardening options.

## Known issues

None specific to this module.
