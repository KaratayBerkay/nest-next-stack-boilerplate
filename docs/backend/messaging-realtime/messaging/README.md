# Messaging (backend)

**Source:** [`nest-js-boilerplate/src/messaging/`](../../../../nest-js-boilerplate/src/messaging/) ·
**Category:** [Messaging & Realtime](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

Direct messages (1:1 "conversations") and group chat rooms — two participant models sharing one
service facade (`MessagingService`) and one delivery path. Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly (not
demo-gated). See
[`messaging.module.ts`](../../../../nest-js-boilerplate/src/messaging/messaging.module.ts).

- **Conversations** — 1:1 DMs between friends only (`sendMessage` throws `ForbiddenException` if the
  recipient isn't an accepted friend — see
  [`messaging-dm.service.ts`](../../../../nest-js-boilerplate/src/messaging/messaging-dm.service.ts)).
- **Rooms** — 5 fixed public rooms (`general`, `random`, `tech`, `design`, `music`) plus any
  `vip-`-prefixed room, gated to `MEDIUM` tier and above (`hasRoomTierAccess`, shared by every join/
  read/write path so the gate can't drift between them — see
  [`messaging-room.service.ts`](../../../../nest-js-boilerplate/src/messaging/messaging-room.service.ts)).

Internally, `MessagingService` is a thin facade delegating to three sub-services, none of which are
independently injectable (constructed directly inside `MessagingService`'s constructor, not
NestJS-provided):

| Sub-service | Owns |
|---|---|
| `MessagingDmService` | conversations, DM send/read/delete/favorite, conversation previews |
| `MessagingFriendService` | the friend-request REST routes' backing logic (see note below) |
| `MessagingRoomService` | room membership (in-memory + Redis Set, cross-instance), room messages |

**Cross-module note:** friend-request send/accept/decline/list REST routes
(`POST /api/friends/request/:userId` etc.) live in **this** module's controller, backed by
`MessagingFriendService` — not in the separate top-level `friends/` module (which is GraphQL-facing;
documented in Phase 2, [social-content/friends/](../../social-content/friends/)). If you're looking
for where a "Friends" REST call is actually implemented, check here first.

## Encryption

All message bodies are stored encrypted at rest — a plaintext `body` row is structurally impossible
(`MessagingDmService.sendMessage` always calls
[`StorageCryptoService`](../wire-crypto/README.md)'s `flattenEnvelope`/`encryptForStorage`, never
writes plaintext). If the client supplies its own transport-layer `envelope`
(`WireEnvelopeV2`, decrypted centrally by the WS gateway before this module ever sees the frame) it's
flattened into the `v`/`ct`/`nonce` columns; otherwise the server encrypts the plaintext itself using
a key it derives from `MESSAGE_STORAGE_MASTER_KEY`. **Both paths are server-decryptable** — see
[wire-crypto/README.md](../wire-crypto/README.md) and
`CROSS-004` (resolved) for why this is not full end-to-end
encryption despite some surviving naming/comments in this module implying otherwise (e.g. references
to "E2EE envelope" in code comments — accurate for the wire-transport layer, not for at-rest storage
or a true content-layer guarantee).

Body decryption (REST, GraphQL `@ResolveField`, and the WS delivery payload) all funnel through one
shared helper, [`message-body.util.ts`](../../../../nest-js-boilerplate/src/messaging/message-body.util.ts)
(`decryptMessageBody`/`buildReplyPreview`), so the three surfaces can't drift in how they decrypt.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| REST controller | [`messaging.controller.ts`](../../../../nest-js-boilerplate/src/messaging/messaging.controller.ts) | [endpoints.md § REST](./endpoints.md#rest) |
| GraphQL resolver | [`messaging.resolver.ts`](../../../../nest-js-boilerplate/src/messaging/messaging.resolver.ts) | [endpoints.md § GraphQL](./endpoints.md#graphql) |
| WS gateway | [`messaging-ws.gateway.ts`](../../../../nest-js-boilerplate/src/messaging/messaging-ws.gateway.ts) | [endpoints.md § WebSocket Events](./endpoints.md#websocket-events) |

All three are **independent entry points** into mostly the same `MessagingService` methods, not
thin wrappers of each other — their response shapes differ in places (see
`BE-003` (resolved) for one confirmed asymmetry). The WS gateway
doesn't own a socket; it registers frame handlers (`direct-message`, `room-message`, `typing-start`,
…) into the shared [`realtime`](../realtime/README.md) gateway via `onModuleInit()`.

All three surfaces guard with `SessionAuthGuard` — see
[identity-access/auth](../../identity-access/auth/README.md) for the token model it checks against.

## Depends on

`AuthModule`, `FriendsModule`, `NotificationModule`, `PushNotificationModule`, `RealtimeModule`,
`RedisModule`, `WireCryptoModule`, `UsageModule` (message-length usage metering — see
[`messaging-dm.service.ts`](../../../../nest-js-boilerplate/src/messaging/messaging-dm.service.ts)'s
`this.usage.assertCanSendMessage` call, documented in Phase 4's
[billing-usage/usage/](../../billing-usage/)).

## Used by

| App | Page / Screen |
|---|---|
| Frontend | [messages](../../../frontend/v1/messages/page.md) · [chat-room](../../../frontend/v1/chat-room/page.md) · [friends](../../../frontend/v1/friends/page.md) · [find-friends](../../../frontend/v1/find-friends/page.md) (friend-request routes + user search, Phase 2 — see [endpoints.md](./endpoints.md) for the per-entry breakdown) |
| Mobile | [messages](../../../mobile/v1/messages/screen.md) · [chat-room](../../../mobile/v1/chat-room/screen.md) · [friends](../../../mobile/v1/friends/screen.md) · [find-friends](../../../mobile/v1/find-friends/screen.md) · [users](../../../mobile/v1/users/README.md) (friends list, user search, friend-request routes — see [endpoints.md](./endpoints.md)) |

## Known issues

- `CROSS-001` (resolved) — Flutter has no equivalent of the web's favorite/group
  filter-pills sidebar feature.
- `BE-003` (resolved) — the REST `sendMessage` response leaks an internal `delivery`
  field the GraphQL mutation deliberately strips.
