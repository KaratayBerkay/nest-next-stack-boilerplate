# Devices — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/devices/`](../../../../nest-js-boilerplate/src/devices/)

## REST

Base path: none (`@Controller('devices')`, no `/api` prefix — confirmed in
[`device.controller.ts`](../../../../nest-js-boilerplate/src/devices/device.controller.ts), unlike
most REST controllers in this codebase which sit under `/api`).

### Device handshake

**Kind:** REST · **`POST /devices/handshake`**
**Source:** [`device.controller.ts#L13-17`](../../../../nest-js-boilerplate/src/devices/device.controller.ts),
logic in [`device.service.ts#L81-94`](../../../../nest-js-boilerplate/src/devices/device.service.ts)
**Auth:** **none — public, pre-auth.** No `@UseGuards()` on this controller at all; called before a
session exists.
**Request:** no body required.
**Response:** `{ deviceToken: string }`.
**Behavior:** reads the incoming device cookie (header `x-device-token` first, then the cookie itself
— see [README.md § Cookie mechanics](./README.md#cookie-mechanics)). If present, re-writes it
unchanged to slide the 1-year expiry. If absent, mints a new random token
(`CryptoService.randomToken()`) and sets it. **No `Device` Postgres row is created here** — that only
happens at actual login/register, via the separate `resolveForLogin` path (see
[README.md](./README.md#two-call-paths-into-deviceservice-not-one)).
**Errors:** none — this handler doesn't throw; a downstream cookie-write failure would surface as a
generic 500, not a modeled exception.
**Used by:** Frontend — app-wide auth bootstrap, not page-specific, via the BFF route
`POST /api/auth/device-handshake` (folder-organized under `auth` despite being this module's
endpoint — see [README.md § Used by](./README.md#used-by)); Mobile — direct REST, same path, from
[`api/server/auth/device_handshake.dart`](../../../../flutter-boilerplate/lib/api/server/auth/device_handshake.dart).
