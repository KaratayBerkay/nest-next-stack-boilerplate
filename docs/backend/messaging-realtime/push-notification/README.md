# Push Notification (backend)

**Source:** [`nest-js-boilerplate/src/push-notification/`](../../../../nest-js-boilerplate/src/push-notification/) ·
**Category:** [Messaging & Realtime](../README.md) · **Real-time docs:** [endpoints.md](./endpoints.md)

Web Push (browser/OS-level push, delivered even when no tab/app is focused) — a different mechanism
from the in-app notification feed documented in [../notification/README.md](../notification/README.md).
Two files, two roles:

- [`push-subscription.service.ts`](../../../../nest-js-boilerplate/src/push-notification/push-subscription.service.ts) —
  CRUD on `PushSubscription` rows (one per browser/device: `endpoint` + `p256dh`/`auth` VAPID keys),
  exposed via [`push-subscription.resolver.ts`](../../../../nest-js-boilerplate/src/push-notification/push-subscription.resolver.ts)
  (**GraphQL only — no REST controller exists in this module**).
- [`push-notification.service.ts`](../../../../nest-js-boilerplate/src/push-notification/push-notification.service.ts) —
  `sendToUser()`, the actual send path (the `web-push` npm package, VAPID-signed). Not exposed to any
  client directly — called in-process by two other modules (below). On a `410`/`404` from a push
  provider (subscription expired/gone), it deletes that `PushSubscription` row automatically.

## Who calls `sendToUser()`

| Caller | When |
|---|---|
| [`notification/notification.service.ts`](../notification/README.md) | After creating any of the 5 real in-app notification types, if the recipient has no live `NOTIFICATION`-topic WebSocket connection |
| [`messaging/messaging-dm.service.ts`](../messaging/README.md) | After a direct message is delivered, if the recipient has no live `MESSAGE`-*and*-no live `NOTIFICATION` WebSocket connection (a stricter, separate gate — DMs never become `Notification` rows) |

Room/group messages never push — `MessagingRoomService` has no `PushNotificationService` reference.
See [../notification/README.md § How this relates to push notifications](../notification/README.md)
for the full picture.

## Frontend

Web's [notification page](../../../frontend/v1/notification/page.md) hosts the one real subscribe/
unsubscribe UI, via [`usePushNotifications`](../../../../next-js-boilerplate/src/hooks/usePushNotifications.ts)
(browser `PushManager` + a `/sw.js` service worker) →
[`usePushNotificationActions`](../../../../next-js-boilerplate/src/api/client/push-notifications/actions.ts) →
`app/api/push/{subscribe,unsubscribe}/route.ts` (BFF, bearer-token auth — both routes carry a comment
explaining the backend's cookie-name mismatch forces an explicit `Authorization` header instead of
relying on the guard's cookie fallback) → this module's `subscribePush`/`unsubscribePush` mutations.

## Known issues

- ⚠ [CROSS-021](../../../issues.md#cross-021): mobile's push-notification integration is
  non-functional end-to-end — it targets Firebase Cloud Messaging, which nothing in this module (or
  anywhere in the backend) implements; this module only ever speaks Web Push. See
  [notification/README.md § Known issues](../notification/README.md#known-issues) for the full,
  three-part breakdown (this was found while documenting the `notification` vertical, not this one).
- [BE-015](../../../issues.md#be-015): `myPushSubscriptions` (list a user's own registered
  subscriptions) has no caller on either platform — users can subscribe/unsubscribe but never see or
  manage a list of their registered devices.
