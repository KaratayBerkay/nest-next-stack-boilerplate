# Messaging & Realtime

Direct messages, group chat rooms, live delivery, the two crypto layers that protect message content
in transit and at rest, in-app + push notifications, and attachment upload/storage. ✅ Complete
(Phase 3).

| Module | Interfaces | Docs |
|---|---|---|
| [messaging](./messaging/) | REST controller, GraphQL resolver, WS gateway | [README](./messaging/README.md) · [endpoints](./messaging/endpoints.md) |
| [realtime](./realtime/) | WS gateway (transport owner — `messaging`'s gateway registers handlers into this one) | [README](./realtime/README.md) |
| [wire-crypto](./wire-crypto/) | REST controller (handshake/re-key/server-key) | [README](./wire-crypto/README.md) |
| [notification](./notification/) | REST controller (dead, see [Known issues](./notification/README.md#known-issues)), GraphQL resolver | [README](./notification/README.md) · [endpoints](./notification/endpoints.md) |
| [push-notification](./push-notification/) | GraphQL resolver only, no REST controller | [README](./push-notification/README.md) · [endpoints](./push-notification/endpoints.md) |
| [upload](./upload/) | REST controller | [README](./upload/README.md) · [endpoints](./upload/endpoints.md) |

## How the pieces fit together

`messaging`'s [REST controller](./messaging/endpoints.md#rest) and
[GraphQL resolver](./messaging/endpoints.md#graphql) handle request/response actions (send, delete,
list, favorite). Its [WS gateway](./messaging/endpoints.md#websocket-events) handles live
delivery, but doesn't own a WebSocket connection itself — it registers frame handlers
(`direct-message`, `room-message`, `typing-start`, …) into the shared
[`realtime`](./realtime/README.md) gateway, which owns the actual `/ws` transport, auth, and
generic emit primitives (`emitToUser`, `emitToPage`, `emitToService`, `broadcastToRoom`, …) used by
messaging and by every other feature that pushes live updates (notifications, feed).

Both the WS transport and the Postgres-at-rest message body go through
[`wire-crypto`](./wire-crypto/README.md) — two independent encryption layers (session-transport,
storage-at-rest), both server-held-key, neither end-to-end. See
[../../architecture.md § Wire encryption](../../architecture.md#wire-encryption--trusted-server-transport--at-rest-encryption)
for why, and [../../issues.md#cross-004](../../issues.md#cross-004) for a doc-accuracy finding tied
to this specific area.

## Used by

| App | Page / Screen |
|---|---|
| Frontend | [messages](../../frontend/v1/messages/page.md) · [chat-room](../../frontend/v1/chat-room/page.md) · [notification](../../frontend/v1/notification/page.md) |
| Mobile | [messages](../../mobile/v1/messages/screen.md) · [chat-room](../../mobile/v1/chat-room/screen.md) · [notification](../../mobile/v1/notification/screen.md) |

## Notable findings from Phase 3

[CROSS-020](../../issues.md#cross-020) (HIGH — the in-app notification feed leaks a `hideAvatar`
user's real avatar, live and exploitable on mobile) and [CROSS-021](../../issues.md#cross-021)
(HIGH — mobile push notifications are non-functional end-to-end, built against Firebase Cloud
Messaging while this backend only ever implemented Web Push) are the two most significant findings.
[BE-016](../../issues.md#be-016) (HIGH — the VIP chat room has no backing database row; sending a
message in it fails for every user who reaches it) and [BE-017](../../issues.md#be-017) (MED — an
attachment-ownership check gap in the room/DM message-send path) round out the backend side.
[CROSS-024](../../issues.md#cross-024) (chat-room has no reply-to or delete-message capability at all,
structurally, unlike 1:1 messaging) and [CROSS-027](../../issues.md#cross-027)/[CROSS-028](../../issues.md#cross-028)
(mobile never surfaces server-generated thumbnails, and has no attachment-gallery feature at all —
resolving a "verify in Phase 3" flag left open since Phase 0) are the standout parity gaps. Full list:
[issues.md](../../issues.md).
