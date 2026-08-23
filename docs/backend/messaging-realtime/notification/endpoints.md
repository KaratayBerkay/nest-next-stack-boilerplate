# Notification — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/notification/`](../../../../nest-js-boilerplate/src/notification/)

## REST

Base path: `/api` (`@Controller('api')` in
[`notification.controller.ts`](../../../../nest-js-boilerplate/src/notification/notification.controller.ts)).
**Auth:** `SessionAuthGuard` on the whole controller — see
[identity-access/auth](../../identity-access/auth/README.md). ⚠ Every endpoint below has **zero
real callers on either platform** — see
[README.md § Interfaces](./README.md#interfaces) and
[BE-012](../../../issues.md#be-012). Documented in full regardless, since it's a live, guarded,
behaviorally-correct surface — just an unused one.

### List notifications

**Kind:** REST · **`GET /api/notifications`** · query `cursor?`, `take?` (default 20, capped 100)
**Source:** [`notification.controller.ts#L12-L55`](../../../../nest-js-boilerplate/src/notification/notification.controller.ts)
**Response:** `{ items: Notification[], hasMore: boolean }`, newest-first; over-fetches by one row
internally to compute `hasMore`. Each item's `actor.avatarUrl` is redacted to `null` when the actor
has `hideAvatar` set and isn't the caller themself.
**Used by:** nobody — see [BE-012](../../../issues.md#be-012).

### Get unread notification count

**Kind:** REST · **`GET /api/notifications/unread-count`**
**Source:** [`notification.controller.ts#L57-L60`](../../../../nest-js-boilerplate/src/notification/notification.controller.ts)
**Response:** a bare number. Served from the `SessionAuthGuard`-attached Redis session snapshot
(`user.unread`) when present, falling back to a live `COUNT` query only if that field is absent —
zero-Postgres hot path, the same pattern as auth's `me` query and messaging's friends list.
**Used by:** nobody — see [BE-012](../../../issues.md#be-012).

### Mark notifications read

**Kind:** REST · **`POST /api/notifications/read`**
**Source:** [`notification.controller.ts#L62-L73`](../../../../nest-js-boilerplate/src/notification/notification.controller.ts)
**Request body:** `{ id?: string }` (mark one) or `{ all: true }` (mark every unread notification
for the caller) — one endpoint, not two, unlike the GraphQL side below.
**Response:** `{ success: true }` unconditionally — even a body with neither `id` nor `all` silently
succeeds as a no-op rather than 400ing.
**Used by:** nobody — see [BE-012](../../../issues.md#be-012).

## GraphQL

Resolver: [`notification.resolver.ts`](../../../../nest-js-boilerplate/src/notification/notification.resolver.ts) ·
**Auth:** `SessionAuthGuard` on the whole resolver class. This is the surface both frontend and
mobile actually call for 100% of notification list/read/count operations — see
[frontend api.md](../../../frontend/v1/notification/api.md) and
[mobile api.md](../../../mobile/v1/notification/api.md).

### List my notifications

**Kind:** GraphQL Query · **`myNotifications(cursor: ID, take: Int): NotificationsPage!`**
**Source:** [`notification.resolver.ts#L15-L32`](../../../../nest-js-boilerplate/src/notification/notification.resolver.ts),
model [`notifications-page.model.ts`](../../../../nest-js-boilerplate/src/notification/models/notifications-page.model.ts)
**Response:** `{ items: [Notification!]!, hasMore: Boolean! }` — same over-fetch-by-one/slice logic
as the REST list endpoint above, per an inline comment referencing it explicitly. `take` is clamped
to `[1, 100]`, default 20.
**`Notification.actor`** is the raw generated `User` GraphQL type
([`@generated/notification/notification.model.ts`](../../../../nest-js-boilerplate/src/@generated/notification/notification.model.ts)),
exposed via the Prisma `include: {actor: true}` relation with **no field remapping**. ⚠
[CROSS-020](../../../issues.md#cross-020): unlike the REST list endpoint above, and unlike this module's own
realtime push DTO (see
[README.md § Live delivery over realtime](./README.md#live-delivery-over-realtime)), nothing on this
path redacts `avatarUrl` for an actor with `hideAvatar` set.
**Used by:** Frontend [notification page](../../../frontend/v1/notification/page.md) — via
[api.md § List notifications (BFF route)](../../../frontend/v1/notification/api.md#list-notifications-bff-route) — selects
`actor {id name email}`, **not** `avatarUrl`, so the redaction gap has no current effect on web.
Mobile [notification screen](../../../mobile/v1/notification/screen.md) — via
[api.md](../../../mobile/v1/notification/api.md) — selects **and renders**
`actor {id name avatarUrl}` as an actual avatar image, so the gap is live there. Also called by the
site-wide [`NotificationDropdown`](../../../../next-js-boilerplate/src/components/feed/NotificationDropdown.tsx)
chrome component (same query, same BFF route, outside the notification vertical's own page).

### Get unread notification count (GraphQL)

**Kind:** GraphQL Query · **`unreadNotificationCount: Int!`**
**Source:** [`notification.resolver.ts#L34-L38`](../../../../nest-js-boilerplate/src/notification/notification.resolver.ts)
Same Redis-snapshot-first logic as the REST entry above.
**Used by:** Frontend [notification page](../../../frontend/v1/notification/page.md) and
`NotificationDropdown`'s bell badge; Mobile
[notification screen](../../../mobile/v1/notification/screen.md) and `v1_header.dart`'s bell badge.
⚠ Also the accidental target of [MOB-012](../../../issues.md#mob-012) — a mobile file named and
positioned for a different purpose (fetching the DM-unread count) queries this same operation
instead of a DM-specific one.

### Mark one notification read

**Kind:** GraphQL Mutation · **`markNotificationRead(id: ID!): Boolean!`**
**Source:** [`notification.resolver.ts#L40-L47`](../../../../nest-js-boilerplate/src/notification/notification.resolver.ts)
**Response:** whether the update actually matched a row (`result.count > 0`) — `false` for an
unknown or another user's `id` rather than throwing.
**Realtime side-effect:** a `Count` renew, only if the update matched — see
[README.md § Live delivery over realtime](./README.md#live-delivery-over-realtime).
**Used by:** Frontend [notification page](../../../frontend/v1/notification/page.md) (per-item
click) and `NotificationDropdown` (per-item click, plus opening the panel while unread items exist —
see [frontend api.md](../../../frontend/v1/notification/api.md)); Mobile
[notification screen](../../../mobile/v1/notification/screen.md) (per-item tap).

### Mark all notifications read

**Kind:** GraphQL Mutation · **`markAllNotificationsRead: Boolean!`**
**Source:** [`notification.resolver.ts#L49-L53`](../../../../nest-js-boilerplate/src/notification/notification.resolver.ts)
**Response:** always `true`.
**Realtime side-effect:** a `Count` renew (value `0`) **and** a `Read` renew — see
[README.md § Live delivery over realtime](./README.md#live-delivery-over-realtime).
**Used by:** Frontend [notification page](../../../frontend/v1/notification/page.md) — fires
**automatically, once, on first successful load** (not just from the explicit "Mark all read"
button — see [page.md § Behavior notes](../../../frontend/v1/notification/page.md)), and also from
that button, and from `NotificationDropdown` opening while unread items exist; Mobile
[notification screen](../../../mobile/v1/notification/screen.md) — **button-only**, no auto-mark-on-
open — see ⚠ [CROSS-023](../../../issues.md#cross-023) for this parity gap.

## Known issues

- [CROSS-020](../../../issues.md#cross-020) — `myNotifications`'s `actor.avatarUrl` isn't `hideAvatar`-
  redacted; live on mobile.
- [BE-012](../../../issues.md#be-012) — the whole REST surface above is dead.
- [MOB-012](../../../issues.md#mob-012) — a mobile file misnamed/miswired to hit
  `unreadNotificationCount` instead of a DM-count operation.
- [CROSS-023](../../../issues.md#cross-023) — web auto-marks-all-read on page open; mobile doesn't.
- Full findings with severity are filed in [`issues.md`](../../../issues.md).
