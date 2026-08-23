# Devices (backend)

**Source:** [`nest-js-boilerplate/src/devices/`](../../../../nest-js-boilerplate/src/devices/) ·
**Category:** [Identity & Access](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

This module **does** have its own controller — one public, pre-auth endpoint
(`POST /devices/handshake`) that mints or slides a long-lived device-identity cookie before any login
happens. It also exports `DeviceService` for `auth/` to call directly (not through HTTP) at actual
login/register time, and a global IP-change-detection middleware. Not wired into
`app.module.ts`'s `CORE_MODULES`/`DEMO_MODULES` arrays directly — it reaches production through
[`AuthModule`](../../../../nest-js-boilerplate/src/auth/auth.module.ts)'s own imports (`DevicesModule`
is also imported by the demo-gated `CookiesSsrModule`, but `AuthModule` alone — which *is* core — is
enough to register `DeviceController`). See
[`devices.module.ts`](../../../../nest-js-boilerplate/src/devices/devices.module.ts).

## Two call paths into `DeviceService`, not one

| Method | Reached via | Auth | Purpose |
|---|---|---|---|
| `handshake(ctx)` | `POST /devices/handshake` (this module's own controller) | **none — public** | Called on every page load, before login. Mints a "landing" device token cookie if absent, or slides its 1-year expiry if present. Creates **no** `Device` row yet. |
| `resolveForLogin(userId, ctx)` | called directly (not over HTTP) from `auth/`'s login/register services | n/a — internal | Turns the landing token into a real `Device` row tied to `userId` at the moment of login (reuse / claim / mint, see below), enforces `MAX_DEVICES_PER_USER` (default 10, oldest evicted), and is what actually produces the `deviceId`/`deviceToken`/`changed`/`trusted` fields that end up in the session's Redis compound key. |

`resolveForLogin`'s reuse/claim/mint branching (`device.service.ts#L106-204`) is genuinely part of the
login flow's contract, not this module's — it's called from
[`auth-registration.service.ts`, `auth.service.ts`, and `auth-login.service.ts`](../../../../nest-js-boilerplate/src/auth/)
(confirmed by grep, not inferred). Full login-sequence documentation (what `changed`/`trusted` drive, how the result feeds
`TokenDerivationService`) belongs to [identity-access/auth](../auth/README.md)'s login-flow docs —
written concurrently with this file, same run. `auth/endpoints.md` itself also documents
`POST /devices/handshake` from the login flow's point of view (its own § Device handshake, an explicit
exception to its stated scope boundary) — the two entries describe the same endpoint from each
module's own vantage point, the same pattern messaging/friends use for cross-module routes. This
module documents its own public endpoint below and notes the dependency; it does not duplicate the
login sequence.

## Cookie mechanics

`device_token` (dev) / `__Secure-device` (prod) — see
[`device-cookie.ts`](../../../../nest-js-boilerplate/src/devices/device-cookie.ts), 1-year max-age,
httpOnly + `Secure`-by-env options from the shared
[`cookie.factory`](../../../../nest-js-boilerplate/src/common/cookies/cookie.factory.ts). Both
`handshake()` and `resolveForLogin()` read the incoming cookie with a **header-first** fallback:
`DeviceService.readCookie` checks `x-device-token` before the cookie itself, because in production the
BFF forwards the token as that header (the backend's cookie is `__Secure-`-prefixed, the BFF's own
cookie jar isn't) — same cross-origin cookie-bridge problem
[architecture.md § BFF proxy pattern](../../../architecture.md#bff-proxy-pattern--nextjs-sits-between-the-browser-and-the-backend)
describes generally.

## `DeviceIpMiddleware` — global, not module-scoped

[`device-ip-middleware.ts`](../../../../nest-js-boilerplate/src/devices/device-ip-middleware.ts) is
**not** wired via `CsrfModule`-style `configure()`/`forRoutes()` — it's applied globally in
[`main.ts#L132-133`](../../../../nest-js-boilerplate/src/main.ts)
(`app.use(deviceIpMw.use.bind(deviceIpMw))`), so it runs on every request that carries a device
cookie, regardless of module. On an IP change for a known device: updates `Device.ip`, logs a
`device-change` event, and — only when `AUTH_IP_STRICT=true` — clears the cookie and throws `401`.
Otherwise (the default) it's observational only. This is the same `AUTH_IP_STRICT` flag
[`SessionAuthGuard`](../auth/README.md#sessionauthguard--validation-order) checks for its own,
separate IP/user-agent mismatch logging — two independent checks sharing one env flag, not one shared
code path.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| REST controller | [`device.controller.ts`](../../../../nest-js-boilerplate/src/devices/device.controller.ts) | [endpoints.md](./endpoints.md) |

## Depends on

Nothing beyond `PrismaService`/`CryptoService`/`ConfigService`. Exported for `AuthModule` to consume
directly (`DeviceService`) and for global middleware registration (`DeviceIpMiddleware`).

## Used by

| App | Where | Endpoint |
|---|---|---|
| Frontend | app-wide auth bootstrap — [`hooks/useAuth.tsx`](../../../../next-js-boilerplate/src/features/auth/hooks/useAuth.tsx), [`lib/crypto/session.ts`](../../../../next-js-boilerplate/src/lib/crypto/session.ts) — **not** page-specific | `POST /devices/handshake` via the BFF route `api/server/auth/device-handshake.ts` |
| Mobile | app-wide auth bootstrap (equivalent call site) | same endpoint, direct REST — [`api/server/auth/device_handshake.dart`](../../../../flutter-boilerplate/lib/api/server/auth/device_handshake.dart) |

Like [wire-crypto](../../messaging-realtime/wire-crypto/README.md), this is not a page-level
dependency — every authenticated page indirectly relies on the device cookie having been minted, but
no single settings page "owns" the call. See
[frontend auth/api.md § Server / BFF](../../../frontend/auth/api.md#server--bff-srcapiserverauth) for
the `device-handshake.ts` row — exactly where the BFF route lives despite sitting in an `auth`-named
folder.

## Known issues

None specific to this module beyond the login-flow cross-reference above (see
[auth/README.md](../auth/README.md)).
