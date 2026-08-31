# Notification — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/notifications/`](../../../../flutter-boilerplate/lib/api/client/notifications/) ·
Server: [`lib/api/server/notifications/`](../../../../flutter-boilerplate/lib/api/server/notifications/)

All calls use the shared `Dio` instance (`dioProvider`,
[`lib/lib/api_client.dart`](../../../../flutter-boilerplate/lib/lib/api_client.dart) — the doubled
`lib/lib/` segment is real, matching the [messages](../messages/api.md) vertical's own note), base
URL = `AppConfig.apiBaseUrl` (the NestJS backend directly, confirmed not the Next.js app —
`apiBaseUrl` is a dedicated backend-only config, distinct from wherever the frontend happens to run).

## Shape per file

Per [conventions.md § 9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement) —
verified per file, not assumed:

| File | Shape | Path/operation | Backend endpoint |
|---|---|---|---|
| [`list.dart`](../../../../flutter-boilerplate/lib/api/server/notifications/list.dart) | Direct GraphQL | `query MyNotifications` | [List my notifications](../../../backend/messaging-realtime/notification/endpoints.md#list-my-notifications) |
| [`mark_read.dart`](../../../../flutter-boilerplate/lib/api/server/notifications/mark_read.dart) | Direct GraphQL | `mutation MarkNotificationRead($id: ID!) { markNotificationRead(id: $id) }` | [Mark one notification read](../../../backend/messaging-realtime/notification/endpoints.md#mark-one-notification-read) — the live implementation |
| [`read.dart`](../../../../flutter-boilerplate/lib/api/server/notifications/read.dart) | Direct GraphQL | `.markAllRead()` → `mutation MarkAllNotificationsRead` (live); `.markRead()` → an **invalid** query, `{ id read }` selected on a `Boolean` field (dead — see [hooks.md](./hooks.md)) | [Mark all notifications read](../../../backend/messaging-realtime/notification/endpoints.md#mark-all-notifications-read) |
| [`unread_count.dart`](../../../../flutter-boilerplate/lib/api/server/notifications/unread_count.dart) | Direct GraphQL | `query UnreadNotificationCount` | [Get unread notification count (GraphQL)](../../../backend/messaging-realtime/notification/endpoints.md#get-unread-notification-count-graphql) |
| [`dm_unread_count.dart`](../../../../flutter-boilerplate/lib/api/server/messages/dm_unread_count.dart) (moved to `api/server/messages/` in a later pass) | Direct GraphQL — **wrong query** | Sends the **same** `query UnreadNotificationCount` as `unread_count.dart` above, not a DM-specific operation | Same GraphQL query as above — see `MOB-012` (resolved); currently unreachable (see [hooks.md](./hooks.md)) |

No REST-shaped file exists for the notification list itself — this vertical is 100% GraphQL on
mobile, same conclusion as web (see
[backend/notification/README.md § Interfaces](../../../backend/messaging-realtime/notification/README.md#interfaces)).
The dead REST-shaped Dart constants (`ApiUrls.notifications`/`notificationsRead`/
`notificationsUnreadCount` in
[`constants/api/urls.dart`](../../../../flutter-boilerplate/lib/constants/api/urls.dart)) have zero
call sites anywhere in `flutter-boilerplate/lib`.

## Client layer (`lib/api/client/notifications/`)

| File | Purpose |
|---|---|
| [`actions.dart`](../../../../flutter-boilerplate/lib/api/client/notifications/actions.dart) | `notificationActionsProvider` → `NotificationActions` (`markRead`, `markAllRead`) — the live implementation, see [hooks.md](./hooks.md) |
| [`query.dart`](../../../../flutter-boilerplate/lib/api/client/notifications/query.dart) | `notificationsProvider`, `notificationsUnreadCountProvider`, `dmUnreadNotificationsProvider` (buggy, see above) |
| `mark_read.dart` | `markReadNotificationsProvider` — was dead, **deleted** in a later cleanup pass; see [hooks.md](./hooks.md) |

## Push notifications — three uncoordinated, all-broken paths

Unlike the notification list above, none of this works — see
[screen.md § Known issues](./screen.md#known-issues) and `CROSS-021` (resolved) for the
full write-up. Summary of the three separate code paths found while documenting this vertical:

| File | Shape | Target | Outcome |
|---|---|---|---|
| [`services/push_notification_service.dart`](../../../../flutter-boilerplate/lib/services/push_notification_service.dart) (not under `lib/api/` — a standalone service, wired into app startup) | Direct REST | `POST /api/push-notifications/register` (FCM device token) | **Live call, dead endpoint** — no matching backend route exists at all |
| [`api/server/push_notifications/subscribe.dart`](../../../../flutter-boilerplate/lib/api/server/push_notifications/subscribe.dart) | Direct REST | `POST /api/push/subscribe` | **Dead call** (zero callers — see [hooks.md](./hooks.md)'s sibling note on the same file-duplication pattern); would also hit a nonexistent backend route if ever called — the backend only exposes push-subscription management via GraphQL |
| [`api/server/push_notifications/unsubscribe.dart`](../../../../flutter-boilerplate/lib/api/server/push_notifications/unsubscribe.dart) | Direct REST | `POST /api/push/unsubscribe` | Same as above |

`api/client/push_notifications/actions.dart`'s `pushActionsProvider`/`PushActions` (the client-layer
wrapper around the two dead server files above) also has zero callers.

The backend's actual push-subscription surface —
[`subscribePush`](../../../../nest-js-boilerplate/src/push-notification/push-subscription.resolver.ts)/`unsubscribePush`
(GraphQL mutations, W3C Web Push shape: `endpoint`/`p256dh`/`auth`, not an FCM token) — has **no**
mobile caller at all, correct or otherwise; only the web app calls it (see
[frontend api.md § Push subscribe / unsubscribe](../../../frontend/v1/notification/api.md#push-subscribe--unsubscribe)).
