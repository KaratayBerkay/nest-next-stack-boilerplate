# Notification — Hooks

Screen: [screen.md](./screen.md) · Source: [`lib/api/client/notifications/`](../../../../flutter-boilerplate/lib/api/client/notifications/)

Riverpod providers backing this screen — Flutter's equivalent of web's
[hooks.md](../../../frontend/v1/notification/hooks.md). Three files, and (unusually for this
effort's findings so far) two separate dead/broken duplicates found while reading them.

### `notificationsProvider` / `PaginatedNotificationsNotifier`

[`query.dart`](../../../../flutter-boilerplate/lib/api/client/notifications/query.dart) —
`StateNotifierProvider<PaginatedNotificationsNotifier, PaginatedListState<NotificationItem>>`.
`_initialLoad()` runs in the constructor; `loadMore()` guards against concurrent calls and an empty
list; `prependLive(item)` dedupes by id before splicing a realtime-pushed item onto the front — called
from [`realtime_provider.dart`](../../../../flutter-boilerplate/lib/lib/realtime/realtime_provider.dart)'s
`Notifications`/`Item` frame handler (see
[backend/notification/README.md § Live delivery over realtime](../../../backend/messaging-realtime/notification/README.md#live-delivery-over-realtime)).
Items are newest-first, no reversal (same as web).

### `notificationsUnreadCountProvider`

Same file — `FutureProvider<int>`, backend GraphQL `unreadNotificationCount`. Read by both this
screen's tier views and `v1_header.dart`'s bell badge.

### `dmUnreadNotificationsProvider` — wrong query, currently unreachable

Same file — a `FutureProvider<int>` intended to mirror web's `useDmUnreadCount`, but its server layer
([`dm_unread_count.dart`](../../../../flutter-boilerplate/lib/api/server/messages/dm_unread_count.dart) — moved from `api/server/notifications/` to `api/server/messages/` in a later pass)
sends the **same** `unreadNotificationCount` GraphQL query as the provider above, not a DM-specific
one — there is no GraphQL query for the DM-unread count at all (only the REST
`GET /api/messages/unread-count` — see
[messaging/endpoints.md](../../../backend/messaging-realtime/messaging/endpoints.md#get-total-unread-dm-count)),
so this file cannot return the number its name promises even in principle. See ⚠
`MOB-012` (resolved). Currently harmless in practice: nothing in the app ever
`watch`/`read`s this provider's *value* — [`realtime_provider.dart`](../../../../flutter-boilerplate/lib/lib/realtime/realtime_provider.dart)
only `invalidate()`s it on relevant WS frames, which is a no-op with no active listener. The real,
correctly-implemented DM badge (`v1_header.dart`) watches a **different** provider —
`dmUnreadCountProvider` in
[`api/client/messages/query.dart`](../../../../flutter-boilerplate/lib/api/client/messages/query.dart),
which does correctly call `GET /api/messages/unread-count`.

### `notificationActionsProvider` / `NotificationActions`

[`actions.dart`](../../../../flutter-boilerplate/lib/api/client/notifications/actions.dart) — the
live mark-read implementation: `markRead(id)` calls
[`mark_read.dart`](../../../../flutter-boilerplate/lib/api/server/notifications/mark_read.dart)'s
server (`mutation MarkNotificationRead($id: ID!) { markNotificationRead(id: $id) }`);
`markAllRead()` calls
[`read.dart`](../../../../flutter-boilerplate/lib/api/server/notifications/read.dart)'s
`NotificationReadServer.markAllRead()`. Both invalidate `notificationsProvider` and
`notificationsUnreadCountProvider` after resolving. This is the provider `free_page_view.dart`
actually reads.

### Dead and broken duplicates found while documenting this file

⚠ `MOB-013` (resolved) — same "scaffolded-then-inlined, original left behind" pattern
as `FE-007` (resolved)/`CROSS-013` (resolved), twice over in this
one API layer:

- the since-deleted `api/client/notifications/mark_read.dart`'s
  `markReadNotificationsProvider`/`MarkReadNotifications` (client layer — a second, separate file
  from the server-layer file of the same name above) has zero callers anywhere; superseded by
  `NotificationActions.markRead` above, which reads the server file directly.
- [`read.dart`](../../../../flutter-boilerplate/lib/api/server/notifications/read.dart)'s
  `NotificationReadServer` class is *half* dead: `.markAllRead()` is the live method
  `NotificationActions` calls (see above), but its sibling `.markRead()` method is never called by
  anything — and if it ever were, it would fail: its mutation string requests a `{ id read }`
  selection set on `markNotificationRead`, which the backend schema types as a bare `Boolean!`
  scalar (see
  [notification/endpoints.md#mark-one-notification-read](../../../backend/messaging-realtime/notification/endpoints.md#mark-one-notification-read)) —
  an invalid GraphQL document, since you cannot sub-select fields on a scalar. Unreachable today, so
  this never actually throws in practice.

## Cross-cutting hooks used here but not notification-specific

`currentUserProvider` (`hooks/use_auth.dart`) — read by `TierGate`, not notification-specific;
documented where first introduced.
