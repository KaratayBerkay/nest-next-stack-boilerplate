# Realtime (backend)

**Source:** [`nest-js-boilerplate/src/realtime/`](../../../../nest-js-boilerplate/src/realtime/) ·
**Category:** [Messaging & Realtime](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

The single WebSocket transport (`/ws`, raw `ws` library — **not** socket.io) and the generic
push-delivery primitives every other feature builds on. `RealtimeGateway` owns the connection
lifecycle, auth, and emit routing; it does not itself know about messages, rooms, or notifications —
feature modules ([messaging](../messaging/README.md), notification) register frame handlers into it
via `registerHandler()`/`registerPageCallbacks()` rather than opening their own sockets. Since the
RTC phases (post-docs), [rtc](../rtc/README.md)'s `RtcCallWsGateway`/`RtcChatWsGateway` register the
`rtc:*` frame family the same way — see
[rtc/endpoints.md § WebSocket events](../rtc/endpoints.md#websocket-events-clientserver).

## Auth — WS upgrade, not a first-message protocol

> ⚠ If you've seen older docs or comments describing WS auth as "connect, then send
> `{type:'auth', tokens:{...}}`" — that's gone. See
> [../../../issues.md#cross-005](../../../issues.md#cross-005).

`verifyUpgrade()` runs during the WS handshake, **before a socket is ever created**: it reads the
four session cookies (`access_token`, `rbac_token`, `device_token`, `user_token` — unprefixed; the
`__Secure-` production prefix is a browser-cookie-jar concern the BFF already resolved before this
point) directly off `req.headers.cookie`, unwraps the rbac/user tokens via the shared
[`token-codec`](../../platform-core/common/token-codec/README.md), and validates via
`SessionValidatorService` (the same validator `SessionAuthGuard` uses for HTTP —
see [identity-access/auth](../../identity-access/auth/README.md)). Rejection here means the client
never gets to speak the WebSocket protocol at all — no socket, no handshake exchange. On success,
the server sends `{type:'authenticated', sessionId}` immediately after `connection` fires, with no
wait for anything from the client.

Cheapest checks run first, matching `SessionAuthGuard`'s own ordering: Origin allow-list (skipped
entirely if `CORS_ORIGIN` is unset — WS upgrades aren't covered by `app.enableCors()`, so this is
net-new protection, and treating "unset" as reject-all would break local dev) → per-IP pending-
connection cap (50) → cookie parsing → the one Redis/JWT-touching validation call.

## Connection model

- **One socket per device** — `socketId` is deterministically derived as `ws-<sha256(deviceToken)>`.
  A reconnect carrying the same device token supersedes (closes) that device's previous socket
  *before* the new one registers anywhere, so the shared deterministic id can't clobber live state.
  Token-less clients get a random id instead, so they can never collide with or replace each other.
- **Per-user socket cap**: 20 (oldest closed on overflow). **Per-IP pending cap**: 50.
- **Heartbeat**: 30s ping/pong; unresponsive sockets are terminated.
- **Frame limit**: 64 KiB (`maxPayload`) — an oversized frame surfaces as a per-connection `error`
  event (logged, socket terminated) rather than crashing the process, as long as the `error`
  listener stays attached (it does, registered before any other socket event).
- **Multi-replica**: a Redis pub/sub channel (`ws:broadcast`) fans every emit primitive out to other
  backend instances, so `emitToUser`/`emitToPage`/etc. reach a user's sockets regardless of which
  replica they're connected to. Each publish carries a unique `eid`; an instance skips re-delivering
  its own echoed publish (5s dedup window) to avoid double-sending to local sockets.

## Transport encryption

Every plaintext outbound frame on an authenticated socket is deep-id-encrypted and, for the
`*Encrypted` emit variants, additionally wire-encrypted per-connection via
[wire-crypto](../wire-crypto/README.md) before it reaches `.send()` — wrapped once, centrally, in
the `connection` handler, so no individual call site has to remember to do it. Inbound frames
matching the `WireEnvelopeV2` shape are decrypted centrally in `handleMessage()` before any routing
happens.

## Depends on

`AuthModule` (`forwardRef`), `CryptoModule`, `WireCryptoModule`. Exports `RealtimeGateway` — every
feature module that pushes live updates depends on this one.

## Used by

Directly: [messaging](../messaging/README.md) (registers `direct-message`, `room-message`, etc.),
[notification](../notification/README.md) (registers no frame handlers of its own — pushes
`Notifications`/`Item`/`Count`/`Read` frames via the generic `emitToService` primitive documented
below), feed/post live updates (Phase 2). Indirectly: every page with a live badge
or content push — see [endpoints.md § Server → client frame families](./endpoints.md#server--client-frame-families) for the routing
table.

## Known issues

- [CROSS-005](../../../issues.md#cross-005) — surviving pre-rewrite documentation described a
  removed first-message auth protocol; resolved by this rewrite.
