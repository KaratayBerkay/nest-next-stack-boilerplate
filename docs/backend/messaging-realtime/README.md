# Messaging & Realtime

Direct messages, group chat rooms, live delivery, and the two crypto layers that protect message
content in transit and at rest.

| Module | Interfaces | Docs |
|---|---|---|
| [messaging](./messaging/) | REST controller, GraphQL resolver, WS gateway | ✅ [README](./messaging/README.md) · [endpoints](./messaging/endpoints.md) |
| [realtime](./realtime/) | WS gateway (transport owner — `messaging`'s gateway registers handlers into this one) | ✅ [README](./realtime/README.md) |
| [wire-crypto](./wire-crypto/) | REST controller (handshake/re-key/server-key) | ✅ [README](./wire-crypto/README.md) |
| notification | REST controller, GraphQL resolver | ⬜ Phase 3 |
| push-notification | (service only, no direct controller/resolver — invoked by `messaging`/`notification`) | ⬜ Phase 3 |
| upload | REST controller | ⬜ Phase 3 |

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
| Frontend | [messages](../../frontend/v1/messages/page.md) · chat-room (Phase 3) |
| Mobile | [messages](../../mobile/v1/messages/screen.md) · chat-room (Phase 3) |
