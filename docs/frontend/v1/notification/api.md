# Notification — API

Page: [page.md](./page.md) · Client: [`src/api/client/notifications/`](../../../../next-js-boilerplate/src/api/client/notifications/),
[`src/api/client/push-notifications/`](../../../../next-js-boilerplate/src/api/client/push-notifications/) ·
Server (BFF): [`src/api/server/notifications/`](../../../../next-js-boilerplate/src/api/server/notifications/),
[`src/api/server/push-notifications/`](../../../../next-js-boilerplate/src/api/server/push-notifications/)

**Same three-layer BFF chain as [messages](../messages/api.md#client-srcapiclientmessages)**, and
**100% GraphQL under the hood** — unlike messages (a REST/GraphQL/WS mix), every backend call this
vertical makes, on both the notification-list side and the push-subscription side, goes through the
NestJS GraphQL endpoint:

```
Browser (component) → api/client hook → api/server/*.ts (apiFetch, same-origin)
  → app/api/**/route.ts (real BFF: cookie→header bridge, calls backend via graphqlFetch)
    → NestJS backend (GraphQL)
```

Confirmed by reading every `route.ts` in both `app/api/notifications/` and `app/api/push/` directly
(3 + 2 files, not sampled) — all five call `graphqlFetch`, none call a REST path on the backend.

## Client (`src/api/client/notifications/`)

| File | Exports | Purpose |
|---|---|---|
| [`actions.ts`](../../../../next-js-boilerplate/src/api/client/notifications/actions.ts) | `useNotificationActions()` (`markRead`, `markAllRead`) | The mutation layer this page and `NotificationDropdown` actually call — see [hooks.md](./hooks.md) |
| [`query.ts`](../../../../next-js-boilerplate/src/api/client/notifications/query.ts) | `notificationsQueryOptions`, `unreadCountQueryOptions`, `dmUnreadCountQueryOptions` | React Query option builders — all lazy-`import()` their matching `api/server` file |
| `mark-read.ts` | `useMarkNotificationRead()` | **Deleted** (dedup pass, commit `aa04a418`) — was a dead duplicate of `useNotificationActions()`; see `FE-011` (resolved) and [hooks.md](./hooks.md) |

## Server / BFF routes — notifications (`src/api/server/notifications/`)

### List notifications (BFF route)

**Source:** [`list.ts`](../../../../next-js-boilerplate/src/api/server/notifications/list.ts) ·
`GET NOTIFICATIONS_URL` (`/api/notifications` — a same-origin Next.js path, coincidentally spelled
the same as the backend's own dead REST route; this one hits the real BFF)
→ [`app/api/notifications/route.ts`](../../../../next-js-boilerplate/src/app/api/notifications/route.ts)
→ backend GraphQL `myNotifications`
([notification/endpoints.md#list-my-notifications](../../../backend/messaging-realtime/notification/endpoints.md#list-my-notifications)).
Query selects `actor {id name email}` — no `avatarUrl` (see
`CROSS-020` (resolved)'s web-side note).

### Mark read (BFF route)

**Source:** [`mark-read.ts`](../../../../next-js-boilerplate/src/api/server/notifications/mark-read.ts) —
exports `markNotificationReadServer(id)` / `markAllNotificationsReadServer()`, both `POST
NOTIFICATIONS_READ_URL` with `{id}` or `{all:true}` →
[`app/api/notifications/read/route.ts`](../../../../next-js-boilerplate/src/app/api/notifications/read/route.ts)
(CSRF-echoed — see [identity-access/csrf](../../../backend/identity-access/csrf/README.md)) → backend
GraphQL `markNotificationRead` / `markAllNotificationsRead`
([notification/endpoints.md#mark-one-notification-read](../../../backend/messaging-realtime/notification/endpoints.md#mark-one-notification-read) ·
[#mark-all-notifications-read](../../../backend/messaging-realtime/notification/endpoints.md#mark-all-notifications-read)).

### Everything else

| File | BFF route | Backend operation |
|---|---|---|
| [`unread-count.ts`](../../../../next-js-boilerplate/src/api/server/notifications/unread-count.ts) | `GET NOTIFICATIONS_UNREAD_COUNT_URL` | GraphQL `unreadNotificationCount` ([notification/endpoints.md](../../../backend/messaging-realtime/notification/endpoints.md#get-unread-notification-count-graphql)) |
| [`dm-unread-count.ts`](../../../../next-js-boilerplate/src/api/server/notifications/dm-unread-count.ts) | `GET MESSAGES_UNREAD_COUNT_URL` (a **messaging**-vertical URL constant, reused here) | REST `GET /api/messages/unread-count` ([messaging/endpoints.md](../../../backend/messaging-realtime/messaging/endpoints.md#get-total-unread-dm-count)) — correctly hits the DM count, unlike mobile's equivalent file, see `MOB-012` (resolved) |

## Push notifications

### Push subscribe / unsubscribe

**Client:** [`api/client/push-notifications/actions.ts`](../../../../next-js-boilerplate/src/api/client/push-notifications/actions.ts) —
`usePushNotificationActions()` (`subscribe`, `unsubscribe`), consumed only by
[`usePushNotifications`](./hooks.md#usepushnotifications).
**Server/BFF:** [`subscribe.ts`](../../../../next-js-boilerplate/src/api/server/push-notifications/subscribe.ts) /
[`unsubscribe.ts`](../../../../next-js-boilerplate/src/api/server/push-notifications/unsubscribe.ts) —
`POST PUSH_SUBSCRIBE_URL` / `PUSH_UNSUBSCRIBE_URL` →
[`app/api/push/subscribe/route.ts`](../../../../next-js-boilerplate/src/app/api/push/subscribe/route.ts) /
[`app/api/push/unsubscribe/route.ts`](../../../../next-js-boilerplate/src/app/api/push/unsubscribe/route.ts) —
both bearer-token-authed (explicitly, not the cookie fallback — see the inline comment in each route
about the backend's prod cookie name never matching the BFF's) and CSRF-echoed, then `graphqlFetch` to
the backend's `subscribePush(endpoint, p256dh, auth, userAgent)` / `unsubscribePush(endpoint)`
mutations. These live in `push-notification/`, whose own `endpoints.md` doesn't exist in this pass —
source: [`push-subscription.resolver.ts`](../../../../nest-js-boilerplate/src/push-notification/push-subscription.resolver.ts)
(see [backend/notification/README.md § Known issues](../../../backend/messaging-realtime/notification/README.md#known-issues)
for why).

No frontend file calls the backend's third push-subscription operation,
`myPushSubscriptions` (list a user's registered subscriptions) — see
`BE-015` (resolved — fixed 2026-09-03: the `myPushSubscriptions` query was removed).

## Service worker (bypasses the BFF entirely)

[`public/sw.js`](../../../../next-js-boilerplate/public/sw.js) is not proxied through anything — it's
a static file the browser fetches directly and runs as a separate execution context. It handles two
browser-native events with no network calls of its own: `push` (renders the OS notification from
whatever payload `PushNotificationService.sendToUser()` sent) and `notificationclick` (computes a
target URL and either focuses/`postMessage`s an open `/v1/` tab or opens a new one — handled by
[`V1Shell.tsx`](../../../../next-js-boilerplate/src/views/v1/[lang]/V1Shell.tsx)'s
`serviceWorker.onmessage` listener). ⚠ Its target-URL logic duplicates, and disagrees with,
[`notificationTarget()`](../../../../next-js-boilerplate/src/lib/notifications/target.ts) — see
`CROSS-022` (resolved).
