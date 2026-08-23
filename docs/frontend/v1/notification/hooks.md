# Notification — Hooks

Page: [page.md](./page.md) · Source: [`src/lib/realtime/useNotifications.ts`](../../../../next-js-boilerplate/src/lib/realtime/useNotifications.ts),
[`src/api/client/notifications/`](../../../../next-js-boilerplate/src/api/client/notifications/),
[`src/hooks/usePushNotifications.ts`](../../../../next-js-boilerplate/src/hooks/usePushNotifications.ts)

Unlike [messages](../messages/hooks.md), this vertical has no single page-level state hook
(`useMessagesPage`-shaped) — `NotificationPageContent` composes the hooks below directly.

### `useNotifications`

[`useNotifications.ts`](../../../../next-js-boilerplate/src/lib/realtime/useNotifications.ts) —
`useInfiniteQuery(notificationsQueryOptions())`. Lives under `lib/realtime/` (not
`hooks/notification/`) because it's also the hook the site-wide
[`NotificationDropdown`](../../../../next-js-boilerplate/src/components/feed/NotificationDropdown.tsx)
chrome component shares — both consumers read the exact same React Query cache entry
(`["notifications", "list"]`), so a mark-read from either surface invalidates the other's view too.
Pagination cursor is the `id` of the oldest item fetched so far (items arrive newest-first per page,
no client-side reversal). `staleTime` 30s, `refetchInterval` 60s (polling backstop; live updates
normally arrive over WS — see [page.md § Backend endpoints](./page.md#backend-endpoints-this-page-depends-on)).

### `useUnreadNotificationCount` / `useDmUnreadCount`

Same file — two more thin `useQuery` wrappers. `useUnreadNotificationCount` powers both this page's
header count and `NotificationDropdown`'s badge. `useDmUnreadCount` is defined here too but fetches
from an entirely different backend operation
([`api/server/notifications/dm-unread-count.ts`](../../../../next-js-boilerplate/src/api/server/notifications/dm-unread-count.ts)
calls `MESSAGES_UNREAD_COUNT_URL`, the messaging vertical's own unread-DM-count BFF route — see
[messaging/endpoints.md#get-total-unread-dm-count](../../../backend/messaging-realtime/messaging/endpoints.md#get-total-unread-dm-count)) —
grouped into this file because both counts are chrome-badge concerns, not because DMs are
notifications (they aren't — see
[backend/notification/README.md § Who creates a notification](../../../backend/messaging-realtime/notification/README.md#who-creates-a-notification-and-when)).
Not used by this page directly; documented here since it lives in the same file.

### `useNotificationActions`

[`api/client/notifications/actions.ts`](../../../../next-js-boilerplate/src/api/client/notifications/actions.ts) —
`markRead(id)` / `markAllRead()`, both lazy-`import()`-ing their matching
[`api/server/notifications/mark-read.ts`](../../../../next-js-boilerplate/src/api/server/notifications/mark-read.ts)
BFF wrapper, then invalidating the `["notifications"]` query key on success. This is the hook this
page and `NotificationDropdown` both actually call.

⚠ [FE-011](../../../issues.md#fe-011): a second, complete implementation of the same two actions,
[`useMarkNotificationRead`](../../../../next-js-boilerplate/src/api/client/notifications/mark-read.ts)
(a different file — `api/client/notifications/mark-read.ts`, not to be confused with the BFF wrapper
of the same name under `api/server/`), is exported from the barrel `src/api/index.ts` but has zero
real callers anywhere in the app. Same "scaffolded-then-inlined, original left behind" shape as
[FE-007](../../../issues.md#fe-007) and [CROSS-013](../../../issues.md#cross-013).

### `usePushNotifications`

[`usePushNotifications.ts`](../../../../next-js-boilerplate/src/hooks/usePushNotifications.ts) — the
Web Push (VAPID) subscribe/unsubscribe lifecycle: registers `/sw.js` (see
[`public/sw.js`](../../../../next-js-boilerplate/public/sw.js)), reads the existing
`PushManager` subscription on mount, and exposes `supported`, `permission`, `subscription`,
`requestPermission()` (asks the browser for `Notification` permission, then subscribes via
`pushManager.subscribe()` and persists the subscription server-side through
[`usePushNotificationActions`](../../../../next-js-boilerplate/src/api/client/push-notifications/actions.ts) →
[api.md § Push subscribe](./api.md#push-subscribe--unsubscribe)), and `unsubscribe()` (mirrors the
same round trip in reverse). Consumed by [`NotificationHeader`](./components/notification-header.md)
only — no other page in the app renders push-permission controls.

A separate, simpler component,
[`PushNotificationInit`](../../../../next-js-boilerplate/src/components/PushNotificationInit.tsx)
(rendered from the root `layout.tsx`, app-wide), independently registers the same `/sw.js` on mount
with no subscribe logic of its own — it exists purely so the service worker is registered as early as
possible regardless of whether the user ever visits this page.

## Cross-cutting hooks used here but not notification-specific

`useSwipeGesture`, `useYSwipeGesture`, `useDeviceType`, `useDateDisplayCookie`, `useBreakpoint`,
`useClickOutside` — all defined outside this vertical and shared across pages; documented where first
introduced. See [page.md § Behavior notes](./page.md#behavior-notes) for how the two swipe hooks are
used on this specific page.
