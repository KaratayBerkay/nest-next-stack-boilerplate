# Notification (backend)

**Source:** [`nest-js-boilerplate/src/notification/`](../../../../nest-js-boilerplate/src/notification/) ·
**Category:** [Messaging & Realtime](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

> 🟡 **Scope note.** This doc covers `notification/` only. `push-notification/` (Web Push
> subscription management) is read here only as far as needed to explain this module's own
> behavior — its own docs live at [push-notification/README.md](../push-notification/README.md) and
> [push-notification/endpoints.md](../push-notification/endpoints.md). See
> [Known issues](#known-issues) for the coordination history behind the split.

## What this module owns

The in-app notification list/feed: creates `Notification` rows, serves them back paginated, tracks
an unread count, and pushes live updates over the same WebSocket transport
[realtime](../realtime/README.md) owns. Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly (not
demo-gated), alongside `push-notification`.

One service, [`NotificationService`](../../../../nest-js-boilerplate/src/notification/notification.service.ts),
is the single choke point every notification-producing feature calls through. Its `create()` method
does four things in sequence for every notification, in this order: persist the `Notification` row,
increment a Redis unread counter (fire-and-forget), push a live update over WS, and — conditionally —
fan out a Web Push notification. No other file in this module or elsewhere writes to the
`Notification` table directly (confirmed: `grep -rn "prisma.notification.create"` across
`nest-js-boilerplate/src` returns exactly one hit, inside this method).

## Who creates a notification, and when

Every real producer, confirmed by reading each call site directly (not just grepping the type name):

| Producer | Type | Trigger |
|---|---|---|
| [`messaging-friend.service.ts`](../../../../nest-js-boilerplate/src/messaging/messaging-friend.service.ts)'s `notifyFriendEvent` | `FRIEND_REQUEST` | sending/accepting a friend request (`payload: {kind: 'friend-request'}` or `{kind: 'friend-accepted'}`) — see [messaging/endpoints.md § Send / accept / decline a friend request](../messaging/endpoints.md#send--accept--decline-a-friend-request) |
| [`comment/comment.service.ts`](../../../../nest-js-boilerplate/src/comment/comment.service.ts) | `COMMENT` | someone other than the post author comments (`payload: {postId, commentId}`) |
| [`reactions/reactions.service.ts`](../../../../nest-js-boilerplate/src/reactions/reactions.service.ts) | `REACTION` | someone other than the post/comment author reacts (`payload: {postId, commentId, reactionType}`) |
| [`notification.processor.ts`](../../../../nest-js-boilerplate/src/notification/notification.processor.ts)'s `FRIEND_POST` BullMQ job (queued by [`post/post.service.ts`](../../../../nest-js-boilerplate/src/post/post.service.ts)'s `create()`) | `POST` | one job per new post; the job fans out into one `Notification` row per friend of the author (`payload: {postId}`) |
| [`billing/billing.service.ts`](../../../../nest-js-boilerplate/src/billing/billing.service.ts)'s `sendBillingNotification` helper (4 call sites — upgrade, cancel, scheduled plan-change, immediate plan-change) and one direct call in [`billing/stripe-webhook.controller.ts`](../../../../nest-js-boilerplate/src/billing/stripe-webhook.controller.ts) (a failed-payment forced downgrade) | `BILLING` | subscription lifecycle events — none of the 5 call sites pass a `payload`, so a `BILLING` notification never has a click-through target (see [frontend/v1/notification/page.md § Behavior notes](../../../frontend/v1/notification/page.md)) |

`NotificationType` (the Prisma enum) has 9 values; only the 5 above are ever actually written.
`MENTION`, `FOLLOW`, `SYSTEM`, and `SECURITY` have zero producer anywhere in current backend code —
confirmed via `grep -rn "type: '<VALUE>'"` per value across `nest-js-boilerplate/src`, zero matches
for any of the four. Likely forward-provisioned schema, the same shape as
[BE-008](../../../issues.md#be-008)'s unused `MfaFactor` WebAuthn columns — see ⚠
[BE-014](../../../issues.md#be-014).

**Direct messages are the one obvious near-miss.** A new DM is a very notification-shaped event, but
`messaging-dm.service.ts` **never** creates a `Notification` row for one — it calls
[`PushNotificationService`](../../../../nest-js-boilerplate/src/push-notification/push-notification.service.ts)
directly instead (see below). There is no in-app notification-list entry for "you got a DM"; the
unread indicator for that lives entirely in the messaging vertical's own DM-unread-count
(`GET /api/messages/unread-count`, see
[messaging/endpoints.md](../messaging/endpoints.md#get-total-unread-dm-count)) — a completely
separate counter from this module's `unreadNotificationCount`, with its own separate badge in every
UI that shows both (see the frontend/mobile "Used by" notes below).

## Live delivery over realtime

Every `NotificationService` state change a client should see live goes out via
`RealtimeGateway.emitToService(userId, 'NOTIFICATION', frame)` — the same generic
service-scoped-push primitive [`realtime`](../realtime/README.md) exposes to every feature module,
not a notification-specific transport. A client subscribes once, at connect, by sending
`{type:'register', services:['NOTIFICATION']}` (see
[realtime/endpoints.md § register](../realtime/endpoints.md#register)); after that, the frames below
arrive unprompted on the same `/ws` socket used for messaging/feed pushes.

This table is the concrete per-action mapping behind the generic `Notifications` renew family
[realtime/endpoints.md § Server → client frame families](../realtime/endpoints.md#server--client-frame-families)
already documents:

| `NotificationService` method | Frame(s) emitted |
|---|---|
| `create()` | `{renew:'Notifications', type:'Item', item: <dto>}` immediately, then `{renew:'Notifications', type:'Count', value}` once the post-create count resolves (not blocking the caller) |
| `markRead()` | `{renew:'Notifications', type:'Count', value}` — only if the update actually matched a row |
| `markAllRead()` | `{renew:'Notifications', type:'Count', value: 0}` **and** `{renew:'Notifications', type:'Read'}` |

The `Item` payload is a hand-built DTO (`NotificationEmitDto` in
[`notification.service.ts`](../../../../nest-js-boilerplate/src/notification/notification.service.ts)),
not the raw Prisma row — deliberately, for two reasons: raw actor rows carry `BigInt` columns
(`reputation`, `storageQuotaBytes`) that crash `JSON.stringify`, and the DTO redacts the actor's
`avatarUrl` to `null` when that actor has `hideAvatar` set (and isn't the recipient themself). ⚠ This
redaction is **not** applied consistently everywhere the same underlying data is exposed — see
[CROSS-020](../../../issues.md#cross-020).

## Push notification wiring

This directly answers the "are in-app notifications and push wired together" question: yes, in
exactly one place, and the gating rule that connects them only applies to callers that go through
that one place.

- **`NotificationService.create()`** (all 5 real producers above) calls
  `PushNotificationService.sendToUser()` gated on `!hasServiceConnection(userId, 'NOTIFICATION')` —
  push fires only when the recipient has **no** live `NOTIFICATION`-registered socket. This is the
  rule [realtime/endpoints.md § Server-side emit API](../realtime/endpoints.md#server-side-emit-api-consumed-by-other-backend-modules-in-process)
  already documents generically ("Push-notification gating rule").
- **`messaging-dm.service.ts`** (new DM delivery) calls the **same**
  `PushNotificationService.sendToUser()` directly — bypassing `NotificationService` entirely, since a
  DM never becomes a `Notification` row (see above) — but gates on a **stricter, different**
  condition:
  [`!hasServiceConnection(recipientId,'MESSAGE') && !hasServiceConnection(recipientId,'NOTIFICATION')`](../../../../nest-js-boilerplate/src/messaging/messaging-dm.service.ts#L640-L662)
  — push fires only when the recipient has **neither** socket registered. Room/group messages
  (`MessagingRoomService`) receive no `push` dependency at all — a new room message **never**
  triggers a push notification. DMs and the 5 `NotificationService`-backed types above are the only
  events that ever can.

`PushNotificationService.sendToUser()` itself (fetches every `PushSubscription` row for a user — W3C
Web Push / VAPID, `endpoint`/`p256dh`/`auth`, browser-service-worker subscriptions only — and calls
`web-push`'s `sendNotification` against each, deleting the row on a `410`/`404`) lives entirely
inside `push-notification/`, which this doc does not otherwise cover — see the scope note at the top
of this page.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| REST controller | **removed** — the dead controller [BE-012](../../../issues.md#be-012) flagged was deleted in commit `b98fac8a`; GraphQL is now the only client surface | [endpoints.md § REST](./endpoints.md#rest) |
| GraphQL resolver | [`notification.resolver.ts`](../../../../nest-js-boilerplate/src/notification/notification.resolver.ts) | [endpoints.md § GraphQL](./endpoints.md#graphql) |

This module used to carry a parallel REST surface covering identical ground (list / unread-count /
mark-read, same `NotificationService` calls) — it was **entirely dead**, and the cross-stack
dead-code pass (commit `b98fac8a`) deleted the controller, resolving
[BE-012](../../../issues.md#be-012). The dead-caller evidence that justified the deletion, kept for
the record: the frontend's BFF routes
([`app/api/notifications/*/route.ts`](../../../frontend/v1/notification/api.md)) all use
`graphqlFetch` against the resolver below, never the REST paths, despite one of them
(`NOTIFICATIONS_URL`) coincidentally sharing the exact same path spelling as the backend's own REST
route (`/api/notifications`) — that's the frontend's own same-origin BFF path, a different server
entirely, not a call into this REST controller. Flutter's
[`api/server/notifications/*.dart`](../../../mobile/v1/notification/api.md) files are 100%
`_dio.post('/graphql', ...)`, and the REST-shaped Dart constants
(`ApiUrls.notifications`/`notificationsRead`/`notificationsUnreadCount`) have zero call sites
anywhere in `flutter-boilerplate/lib`. See ⚠ [BE-012](../../../issues.md#be-012).

## Depends on

`AuthModule`, `PushNotificationModule` (see the scope note at the top of this page),
`RealtimeModule`, `BullModule` (registers the `notification` BullMQ queue — see
[`notification.constants.ts`](../../../../nest-js-boilerplate/src/notification/notification.constants.ts)).

## Used by

| App | Page / Screen |
|---|---|
| Frontend | [notification](../../../frontend/v1/notification/page.md) (the list/feed) · [`NotificationDropdown`](../../../../next-js-boilerplate/src/components/feed/NotificationDropdown.tsx) — site-wide chrome bell rendered from `V1Header.tsx` on every `/v1/[lang]/*` page, calling the same GraphQL operations; not folded into the notification vertical's own component docs since its source lives outside `views/notification/` |
| Mobile | [notification](../../../mobile/v1/notification/screen.md) · `v1_header.dart`'s bell badge (navigates to the screen on tap; no inline dropdown panel, unlike web) |

## Known issues

- ⚠ [CROSS-020](../../../issues.md#cross-020) — GraphQL `myNotifications` doesn't redact a `hideAvatar`
  actor's `avatarUrl`, unlike the REST list endpoint and unlike this module's own realtime push DTO;
  live and exploitable on Flutter (its query selects and renders the field), latent on web (its
  query doesn't select the field today).
- ⚠ [BE-012](../../../issues.md#be-012) — the entire REST controller has zero real callers on either
  platform.
- ⚠ [BE-013](../../../issues.md#be-013) — `messaging.controller.ts` and `messaging-ws.gateway.ts`
  each inject `PushNotificationService` and never call it; the real DM-push call site is
  `messaging-dm.service.ts`'s own, separately-constructed copy of the same service.
- ⚠ [CROSS-021](../../../issues.md#cross-021) — mobile push notifications (Firebase Cloud Messaging) are
  non-functional end-to-end: no backend route or mechanism can ever receive or act on an FCM device
  token. The backend-side half of the evidence is above (this module + `push-notification/`'s
  Web-Push-only send path); the app-side half is in
  [mobile/v1/notification/screen.md § Known issues](../../../mobile/v1/notification/screen.md#known-issues).
- ⚠ [BE-014](../../../issues.md#be-014) — 4 of 9 `NotificationType` enum values have no producer.
- ⚠ [BE-015](../../../issues.md#be-015) — `push-notification`'s `myPushSubscriptions` GraphQL query
  (list a user's registered Web Push subscriptions) has no caller on either platform.
- The category index ([`../README.md`](../README.md)) used to describe `push-notification` as having
  "no direct controller/resolver" — written before `PushSubscriptionResolver` existed (or before it
  was noticed). Corrected during merge; see [push-notification/README.md](../push-notification/README.md)
  for the real, current module doc, written in this same pass once the scope-assignment gap below was
  resolved.

**Scope-assignment contradiction found while writing this doc, since resolved:** this Phase's task
brief listed `push-notification/` as one of this module's two backend targets (with detailed
instructions to check for a REST controller there), while a separate section of the same brief marked
`docs/backend/messaging-realtime/push-notification/**` as owned by a concurrently-running parallel
agent (Phase 3b) — confirmed still concurrently active while this doc was written (Phase 3b's
`upload/README.md`/`endpoints.md` and a partial `chat-room` doc set appeared under `docs/` mid-way
through this session). This doc treated `push-notification/` as read-only background context only at
the time (necessary to correctly describe this module's own push-wiring behavior above, and to answer
the brief's own "how are in-app and push notifications wired together" question) and did **not**
create `push-notification/README.md`/`endpoints.md` itself, to avoid a file-write collision with that
parallel agent. That parallel agent has since written both files — see
[push-notification/README.md](../push-notification/README.md) and
[push-notification/endpoints.md](../push-notification/endpoints.md) — closing this gap; not filed as
a numbered `issues.md` row since it was a task-coordination question, not a codebase bug.
