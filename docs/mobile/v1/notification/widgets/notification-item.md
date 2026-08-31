# NotificationItem (widget)

**Source:** [`notification_item.dart`](../../../../../flutter-boilerplate/lib/views/notification/notification_item.dart)
**Model:** [`types/notification/notification_item.dart`](../../../../../flutter-boilerplate/lib/types/notification/notification_item.dart)
**Used in:** [screen.md](../screen.md) (`free_page_view.dart`'s `ListView.separated`)
**Web equivalent:** [NotificationItem component](../../../../frontend/v1/notification/components/notification-item.md)

## Purpose

`StatelessWidget` rendering one row: an `Avatar`, title/body/relative-time, and an unread dot. Unlike
the web equivalent, this widget takes a plain `onTap` callback rather than separate `onRead`/
`onNavigate` props — the caller (`free_page_view.dart`) combines mark-read and navigation into one
closure before passing it down.

## Constructor

```dart
class NotificationItemWidget extends StatelessWidget {
  final NotificationItem item;
  final String lang;
  final VoidCallback? onTap;
  const NotificationItemWidget({super.key, required this.item, required this.lang, this.onTap});
}
```

## The `NotificationItem` model

[`NotificationItem.fromJson`](../../../../../flutter-boilerplate/lib/types/notification/notification_item.dart)
maps the GraphQL response's `actor` object into two convenience fields: `imageUrl` (`actor.avatarUrl`,
falling back to a top-level `imageUrl` field the current query never actually sends) and `isRead`
(derived from `readAt != null` — there's no separate `read` boolean on the wire, `isRead` is computed
client-side from presence/absence of `readAt`).

## Behavior notes vs. web

- **Renders a real avatar image**, unlike web's initials-only circle: `Avatar(imageUrl: item.imageUrl,
  name: item.title)`. This is exactly why `CROSS-020` (resolved)'s backend redaction
  gap is *live* here and not on web — the GraphQL query behind this screen
  ([api.md](../api.md)) selects `actor { id name avatarUrl }`, and this widget actually displays
  whatever comes back. If an actor has `hideAvatar` set, their real avatar image still renders here
  to whoever receives the notification, bypassing that privacy preference — the backend resolver this
  screen calls doesn't apply the same redaction its REST sibling (dead, unused) and its own realtime
  push DTO both apply. See
  [backend/notification/endpoints.md § List my notifications](../../../../backend/messaging-realtime/notification/endpoints.md#list-my-notifications)
  for the resolver-side evidence.
- **Bold/regular title weight distinguishes read state** (`item.isRead ? FontWeight.normal :
  FontWeight.w600`) — web's item only uses a background tint + dot, no font-weight change.

## Calls

This widget has no API calls of its own — `onTap` is supplied whole by `free_page_view.dart`'s
`itemBuilder`, which (for an unread item) calls
`notificationActionsProvider.markRead(item.id)` before computing and pushing the click-through
target (see [screen.md § Click-through target per notification](../screen.md#click-through-target-per-notification)):

```
NotificationItemWidget (onTap)
  → free_page_view.dart's itemBuilder → notificationActionsProvider.markRead()  — api/client/notifications/actions.dart
    → mark_read.dart's NotificationsMarkReadServer                              — api/server/notifications/mark_read.dart
      → backend: GraphQL markNotificationRead(id)
```

- Mobile API layer: [api.md § Shape per file](../api.md#shape-per-file) → `mark_read.dart`
- Backend endpoint: [notification/endpoints.md#mark-one-notification-read](../../../../backend/messaging-realtime/notification/endpoints.md#mark-one-notification-read)

Contrast with the **web** equivalent's click handler, which is also direct GraphQL — same backend
outcome, same transport shape, unlike the messages vertical where the two platforms' delete actions
differ in transport. See
[NotificationItem (web) § Calls](../../../../frontend/v1/notification/components/notification-item.md#calls-indirect--this-component-never-calls-a-hooks-mutation-directly)
for that side.
