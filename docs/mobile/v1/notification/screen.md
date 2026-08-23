# Notification (screen)

**Route:** `/v1/:lang/notification` (GoRouter name `v1Notification`)
**Router registration:** [`router.dart#L321-L322`](../../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `NotificationPageContent` in
[`page_view.dart`](../../../../flutter-boilerplate/lib/views/notification/page_view.dart)
**Web equivalent:** [notification page](../../../frontend/v1/notification/page.md)

## What renders here

Same tier-gate composition pattern as web (`TierGate` wrapping 4 tier widgets):

| Tier | File |
|---|---|
| Free | [`free_page_view.dart`](../../../../flutter-boilerplate/lib/views/notification/free_page_view.dart) — `FreeNotificationPage`, the only real implementation |
| Basic | [`basic_page_view.dart`](../../../../flutter-boilerplate/lib/views/notification/basic_page_view.dart) — `class BasicNotificationPage extends FreeNotificationPage {}`, no overrides |
| Medium | [`medium_page_view.dart`](../../../../flutter-boilerplate/lib/views/notification/medium_page_view.dart) — same pattern |
| Premium | [`premium_page_view.dart`](../../../../flutter-boilerplate/lib/views/notification/premium_page_view.dart) — same pattern |

Confirmed genuinely thin (not just similarly-named) — `Basic`/`Medium`/`PremiumNotificationPage` are
literal `extends FreeNotificationPage` subclasses with an empty body, the same shape as web's
`export const BasicPageView = FreePageView`. Nothing about the notification list is tier-gated.
Not documented as standalone widgets, matching this effort's established convention for this
four-file tier-view pattern (see [messages/screen.md](../messages/screen.md#what-renders-here)).

`FreeNotificationPage` (`ConsumerWidget`, no local `State`) renders a header row (title + "Mark all
read" `TextButton`, inline — not a separate widget file, unlike web's
[`NotificationHeader`](../../../frontend/v1/notification/components/notification-header.md)) above a
`ListView.separated` of [`NotificationItemWidget`](./widgets/notification-item.md) rows, with a
`RefreshIndicator` (pull-to-refresh — web has no gesture equivalent) and a "Load more" button when
more pages exist.

**No push-notification UI on this screen at all** — no permission toggle, no subscribe/unsubscribe
control anywhere in `free_page_view.dart` or its siblings, confirmed by reading all 5 tier-view
files. This isn't a gap so much as a different platform convention: push permission is requested
automatically at app launch (see [Push notifications (mobile)](#push-notifications-mobile) below),
the way iOS/Android apps typically prompt, rather than via an in-page toggle the way a browser
(where permission can't be silently pre-requested) needs one.

## State

Two Riverpod providers from
[`api/client/notifications/query.dart`](../../../../flutter-boilerplate/lib/api/client/notifications/query.dart)
back this screen — `notificationsProvider` (a `StateNotifierProvider` /
`PaginatedNotificationsNotifier`, Riverpod's answer to React Query's `useInfiniteQuery`, same shape as
[feed's `paginatedFeedProvider`](../feed/hooks.md#paginatedfeedprovider--paginatedfeednotifier)) and
`notificationsUnreadCountProvider` (`FutureProvider`, also read by `v1_header.dart`'s bell badge). See
[hooks.md](./hooks.md) for the full provider inventory, including two dead/broken ones found while
documenting this screen.

## Click-through target per notification

Computed inline in `free_page_view.dart`'s `itemBuilder` (not a shared helper function, unlike web's
[`notificationTarget()`](../../../../next-js-boilerplate/src/lib/notifications/target.ts) — this
logic is duplicated by hand here): `kind == 'friend-request' || kind == 'friend-accepted'` →
`/v1/$lang/find-friends/requests`; `postId != null` → `/v1/$lang/posts/$postId`; otherwise no
navigation. This matches web's in-app logic field-for-field. It does **not** match the *push*
notification click target on either platform — see [Known issues](#known-issues).

## Push notifications (mobile)

Wholly separate from the in-app list above, and from Web Push (`push-notification/`'s VAPID/W3C
mechanism the web app uses) — mobile uses **Firebase Cloud Messaging**, via
[`push_notification_service.dart`](../../../../flutter-boilerplate/lib/services/push_notification_service.dart)
(`firebase_messaging` + `flutter_local_notifications`), started from
[`app.dart`](../../../../flutter-boilerplate/lib/app/app.dart)'s `_initServices()` (mobile-only,
`!kIsWeb`, gated on `AppConfig.pushEnabled`) — permission request, foreground/background message
handling, and notification-tap navigation are all wired and would run on a real device. ⚠ None of it
can actually work end-to-end — see [Known issues](#known-issues) for the full, verified break.

## Known issues

- ⚠ **Mobile push notifications are non-functional end-to-end** — see
  [CROSS-021](../../../issues.md#cross-021) for the full write-up. Summary: `push_notification_service.dart`
  registers an FCM device token against `POST /api/push-notifications/register`, a path with no
  backend route at all (confirmed — `nest-js-boilerplate/src` has zero Firebase/FCM code anywhere,
  and `push-notification.module.ts` registers no controllers, only a GraphQL resolver built for W3C
  Web Push subscriptions). A second, separate, entirely unused code path
  ([`api/client/push_notifications/actions.dart`](../../../../flutter-boilerplate/lib/api/client/push_notifications/actions.dart) +
  [`api/server/push_notifications/subscribe.dart`](../../../../flutter-boilerplate/lib/api/server/push_notifications/subscribe.dart)/[`unsubscribe.dart`](../../../../flutter-boilerplate/lib/api/server/push_notifications/unsubscribe.dart))
  POSTs to `/api/push/subscribe`/`/api/push/unsubscribe` — also no matching backend route (the
  backend only exposes this via GraphQL `subscribePush`/`unsubscribePush`, never REST). Even in the
  hypothetical case a token were successfully stored somewhere, the backend's only send mechanism
  (`PushNotificationService.sendToUser()`, [notification/README.md § Push notification wiring](../../../backend/messaging-realtime/notification/README.md#push-notification-wiring))
  is W3C Web Push-only — structurally incapable of reaching an FCM token. Three independent,
  uncoordinated attempts, all broken.
- ⚠ [CROSS-022](../../../issues.md#cross-022) — the push notification-tap handler
  (`navigateFromData` in `push_notification_service.dart`) sends friend-request/accepted taps to
  `/v1/$lang/find-friends` — **not** `/v1/$lang/find-friends/requests`, the target this screen's own
  in-app tap handler uses for the same kind. The file's own comment says it "mirrors the web service
  worker's notificationclick dispatch" — it does mirror that dispatch's bug, not its correct
  behavior (see [frontend api.md § Service worker](../../../frontend/v1/notification/api.md#service-worker-bypasses-the-bff-entirely)).
  Unlike web, mobile's `postId` case is *not* affected — it correctly targets `/v1/$lang/posts/$postId`
  on both the in-app and push paths.
- ⚠ [CROSS-023](../../../issues.md#cross-023) — web auto-marks every notification read on first page load;
  this screen has no equivalent effect, only the explicit "Mark all read" button and per-item taps.
- ⚠ [CROSS-020](../../../issues.md#cross-020) — this screen's GraphQL query selects and renders
  `actor.avatarUrl` as a real image ([`Avatar`](../../../../flutter-boilerplate/lib/components/ui/avatar/avatar.dart)
  widget, via `NotificationItem.imageUrl`), and the backend resolver behind it doesn't redact that
  field for actors with `hideAvatar` set — see
  [widgets/notification-item.md](./widgets/notification-item.md) for the widget-level detail.

## Widgets

1 significant widget in
[`lib/views/notification/`](../../../../flutter-boilerplate/lib/views/notification/):
[notification-item.md](./widgets/notification-item.md)

## API

[api.md](./api.md) — every notification-list operation is direct GraphQL to the NestJS backend, no
BFF hop (same shape as [messages](../messages/screen.md#api)) — but two of the API-layer files
have real bugs found while documenting this screen, see [hooks.md](./hooks.md) and
[api.md](./api.md).
