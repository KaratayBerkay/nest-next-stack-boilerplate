# Architecture

Cross-cutting system design that spans multiple backend modules and/or multiple apps. Module-level
detail lives in [backend/](./backend/README.md); per-page detail lives in
[frontend/](./frontend/README.md) and [mobile/](./mobile/README.md). This page absorbs the
still-accurate content of this repo's former Architecture Decision Records (deleted as part of this
documentation rewrite — see [conventions.md § 11](./conventions.md)); one of the six, on E2EE, was
found to describe a system that was deliberately replaced and is corrected here rather than carried
forward (see [issues.md#cross-004](./issues.md#cross-004)).

## Workspace layout

Two independent Node workspaces (`nest-js-boilerplate`, `next-js-boilerplate`) plus a Flutter app
(`flutter-boilerplate`) share one Postgres/Redis/MinIO infrastructure, orchestrated by the root
`docker-compose.yml`. Each app keeps its own `package.json`/`pubspec.yaml` and can be developed
independently; `pnpm-workspace.yaml` at the repo root ties the two Node apps together for shared
installs. See [docs/README.md](./README.md#workspace-layout) for the directory tree.

## Session authentication — Redis-backed, four-token compound key

A guarded request never touches Postgres: one Redis lookup resolves identity, authorization, and
tier. Every login/register issues four tokens:

| Token | Kind | Lifetime | Cookie | JS-accessible |
|---|---|---|---|---|
| `accessToken` | JWT (HS256) | 15m | `access_token` (`__Secure-` prefix in prod) | No (httpOnly) |
| `refreshToken` | opaque | 30d | `refresh_token` | No (httpOnly) |
| `rbacToken` | opaque | 15m (mirrors access) | `rbac_token` | No (httpOnly) |
| `deviceToken` | opaque (≥90 chars) | 1y | `device_token` | No (httpOnly) |
| `userToken` | opaque | 15m (mirrors access) | `user_token` | **Yes** — deliberately non-httpOnly so client code can read it for WS auth |

All four are combined into one Redis HASH key: `sess:{sha256(access)}:{deriveRbac(rbac)}:{sha256(device)}:{deriveUser(user)}`.
The `rbac`/`user` derivations are **date-bound** (HMAC-SHA256 with today's UTC date), forcing a
silent refresh at midnight. Full detail — derivation formulas, the v2 Redis schema, revocation
semantics, the BFF cookie bridge — lives in
[backend/identity-access/auth/README.md](./backend/identity-access/auth/README.md) (Phase 1).

**Why not plain JWT, or a Postgres sessions table:** JWT-only can't revoke a single session before
expiry; a Postgres session table adds a query to every guarded request. This hybrid gets instant
revocation (delete the Redis key) with zero Postgres reads on the hot path, at the cost of Redis
being a single point of failure — mitigated by fail-closed 503s, AOF persistence, and a
refresh-fallback path.

## BFF proxy pattern — Next.js sits between the browser and the backend

The browser **never** calls the NestJS backend directly:

```
Browser → Next.js Route Handler (BFF) → NestJS GraphQL → Response → Browser
```

The frontend and backend run as separate services on potentially different origins; a backend
httpOnly cookie isn't readable by the frontend's client-side JS, and the backend's cookie names get
a `__Secure-` prefix in production that the BFF has to bridge. The BFF layer
(`next-js-boilerplate/src/app/api/**`, backed by `src/lib/backend.ts`):

- Owns the httpOnly cookies and forwards their values as `x-*-token` headers to the backend
- Handles the CSRF double-submit echo for mutations
- Implements silent refresh (401 → single-flight refresh → retry)
- Forwards the real client IP via `x-forwarded-for`

**Consequence for mobile — verify per vertical, don't assume.** Flutter's GraphQL-shaped calls
(`POST /graphql`, whether via `gql_helper.dart` or hand-rolled) always bypass this BFF and hit the
backend directly — `/graphql` isn't a path the Next.js app serves at all. Flutter's REST-shaped calls
are **not uniformly BFF-routed** — confirmed for the `messages` vertical (Phase 0): every REST call
there hits the path the *backend's own controller* natively serves (e.g. `/api/friends`), not the
frontend's differently-namespaced BFF path (`/api/messages/friends`) — meaning `messages` has **zero
Next.js involvement on mobile**, for either call shape. An earlier research pass in this effort
claimed Flutter's REST calls generally go through the BFF; that claim is retracted for `messages`
and unverified elsewhere — see [issues.md#cross-007](./issues.md#cross-007). See
[conventions.md § 9](./conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)
for the three-shape test to apply per file, and
[issues.md#cross-003](./issues.md#cross-003) for the related note that the backend has no actual API
versioning — the frontend's `v1` URL segment doesn't correspond to anything backend-side.

**Trade-off**: every call incurs an extra HTTP hop, and the frontend can't function without the
backend being reachable (no static-export deployment story).

## Transactional outbox — reliable event emission

Audit logging, notifications, and any other async side effect of a domain change go through an
`OutboxEvent` row written **inside the same database transaction** as the domain write, rather than
firing the event directly from business logic (which risks inconsistency if the event fails after
the DB write commits, or fires before a rollback). A background poller
(`OutboxService.relayPendingEvents()`) claims pending rows with `SELECT ... FOR UPDATE SKIP LOCKED`
and publishes them — in the current implementation this is BullMQ-queue-driven, not cron-polled (see
[issues.md#cross-003](./issues.md#cross-003)'s neighboring finding that the generic `tasks/`
cron-scheduling module is unused demo code). Failed publishes retry with exponential backoff.
Detail: [backend/platform-core/outbox/README.md](./backend/platform-core/outbox/README.md) (Phase 5).

## Tier-based RBAC — two orthogonal authorization axes

1. **Role** (`USER | ADMIN | SUPERADMIN`) — who you are.
2. **Tier** (`FREE | BASIC | MEDIUM | PREMIUM`) — what you've paid for, hierarchical
   (`FREE < BASIC < MEDIUM < PREMIUM`).

Tier enforcement uses `@MinTier(Tier)` + `TierGuard`, reading the tier from the **Redis session
cache**, not the JWT — so `setUserTier()` (admin-only) updates Postgres and rewrites every live
Redis session for that user via a reverse index (`user:{userId}:sessions`); the change takes effect
on the user's *next* request, no re-login required (the old RBAC-token derivation fails, triggering
one silent refresh). Frontend/mobile tier gating (`TierGate` component, tier-branch `*PageView`
files) is **render-only** — every gated backend call is independently enforced server-side.
Detail: [backend/billing-usage/billing/README.md](./backend/billing-usage/billing/README.md) (Phase 4).

## Realtime transport — raw WebSocket, not socket.io

Single `/ws` endpoint (`ws` library, not socket.io), one gateway (`RealtimeGateway`) that owns the
transport, auth, and generic emit primitives; feature gateways (`MessagingWsGateway`, and since the
RTC phases `RtcCallWsGateway`/`RtcChatWsGateway`) register frame handlers into it rather than
opening their own connections. Authentication happens at the **WS
upgrade** (cookie-based, before a socket exists), not via a post-connect message — see
[issues.md#cross-005](./issues.md#cross-005) for why this is worth stating explicitly (older repo
docs described a different, now-removed first-message protocol). One socket per device; a
page-claim protocol (`{type:"page", page:"messages", params:{...}}`) scopes server-push delivery to
whatever route the client is currently on. Full protocol detail:
[backend/messaging-realtime/realtime/README.md](./backend/messaging-realtime/realtime/README.md).

**Web multi-tab leadership (client side):** the browser holds **one WS per browser profile**, not
per tab — tabs elect a leader via `navigator.locks` (`useRealtimeCoordination`); the leader owns the
socket and relays frames/commands over a `BroadcastChannel`, and a joining tab syncs the leader's
current status + presence snapshot via a `hi`/`st`/`presence` handshake. See
[frontend/app-shell.md § Realtime](./frontend/app-shell.md).

## RTC — LiveKit SFU for calls, meetings, live streams

Added after the original architecture pass (RTC phases 1–4). Real-time audio/video does **not**
ride the `/ws` gateway: media flows client ↔ **LiveKit** (`livekit/livekit-server` in
[`docker-compose.yml`](../docker-compose.yml), host networking for its UDP media range). The
backend orchestrates — it mints per-room LiveKit access tokens, drives lifecycle state in Postgres,
and consumes LiveKit's signed webhook (`POST /rtc/webhook/livekit`) to stay truthful about what the
SFU actually did. Signaling that must be push-driven (1:1 call ringing, room chat) rides the
existing `/ws` gateway as `rtc:*` frames. LiveKit identities and room names carry
[id-codec](./backend/platform-core/common/id-codec/README.md)-encrypted ids, never raw uuids.
Tier caps (call/meeting duration, meeting size, go-live gate) are enforced server-side. Full
detail: [backend/messaging-realtime/rtc/README.md](./backend/messaging-realtime/rtc/README.md).

## Wire encryption — trusted-server transport + at-rest encryption

**This replaced a different design.** As of 2026-08-04 this repo deliberately moved off a
client-side X3DH/Double-Ratchet E2EE protocol (no plaintext ever readable server-side) to a
**trusted-server** model: the backend holds a per-session X25519 keypair (Redis), the browser/app
holds a device keypair, ECDH + HKDF derive a shared secret, and message bodies crossing WS/HTTP are
XChaCha20-Poly1305 ciphertext under that shared secret. Message bodies at rest in Postgres are
**separately** encrypted with a key the server derives from `MESSAGE_STORAGE_MASTER_KEY`. Both
layers protect against network observation and a raw DB/backup leak; **neither protects against
server or process compromise**, since the server can always re-derive both keys. This is a
deliberate, documented trade-off (smaller crypto surface, real-time content moderation stays
possible) — not an oversight — but the surviving reference doc for the old design was never marked
superseded, which is why this section exists; see
[issues.md#cross-004](./issues.md#cross-004) for the full account. Detail:
[backend/messaging-realtime/wire-crypto/README.md](./backend/messaging-realtime/wire-crypto/README.md).

## No backend API versioning

There is no `/v2`, no `enableVersioning()`, no `setGlobalPrefix()` — the backend exposes one
GraphQL schema at `/graphql` (plus a handful of REST controllers under real feature modules). The
frontend's `v1/[lang]` URL segment is a **frontend routing convention only**; don't infer a backend
version from it. See [issues.md#cross-003](./issues.md#cross-003).
