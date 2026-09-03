# Push Notification — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/push-notification/`](../../../../nest-js-boilerplate/src/push-notification/)

## GraphQL

All three operations are on
[`push-subscription.resolver.ts`](../../../../nest-js-boilerplate/src/push-notification/push-subscription.resolver.ts).
**Auth:** `SessionAuthGuard` on the whole resolver (class-level `@UseGuards`).

### ~~List my push subscriptions~~ (removed 2026-09-03)

The `myPushSubscriptions` query had no caller on any platform and was deleted — `BE-015` (resolved — fixed 2026-09-03: the `myPushSubscriptions` query was removed).
Subscriptions are still created/removed by the two mutations below; there is no list endpoint.

### Register a push subscription

**Kind:** GraphQL Mutation · **`subscribePush`**
**Source:** [`push-subscription.resolver.ts#L20-L34`](../../../../nest-js-boilerplate/src/push-notification/push-subscription.resolver.ts)

**Request:** `endpoint: String!`, `p256dh: String!`, `auth: String!`, `userAgent: String` — the raw
[W3C Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) subscription object's
fields. **Upsert on `endpoint`**: [`push-subscription.service.ts#L9-27`](../../../../nest-js-boilerplate/src/push-notification/push-subscription.service.ts)
looks up by `endpoint` first — a re-subscribe (e.g. key rotation) updates the existing row's
`p256dh`/`auth`/`userAgent`/`userId` rather than erroring or duplicating.

**Response:** `PushSubscription!` — the created/updated row.

**Used by:**
- Frontend: [notification page](../../../frontend/v1/notification/page.md) via
  [`usePushNotifications`](../../../../next-js-boilerplate/src/hooks/usePushNotifications.ts) →
  `app/api/push/subscribe/route.ts` (BFF, bearer-token auth).
- Mobile: ⚠ `CROSS-021` (resolved) — no working path. Mobile's
  `push_notification_service.dart` targets Firebase Cloud Messaging and never calls this
  Web-Push-shaped mutation at all; a second, separate, also-unused Dart code path
  (`PushActions.subscribe`) would call it with the wrong argument shape if it were ever wired up. See
  [notification/README.md § Known issues](../notification/README.md#known-issues) for the full
  breakdown.

### Unregister a push subscription

**Kind:** GraphQL Mutation · **`unsubscribePush`**
**Source:** [`push-subscription.resolver.ts#L36-L42`](../../../../nest-js-boilerplate/src/push-notification/push-subscription.resolver.ts)

**Request:** `endpoint: String!`.
**Response:** `Boolean!` — always `true` on success (`deleteMany` doesn't error on zero matches).

**Used by:**
- Frontend: [notification page](../../../frontend/v1/notification/page.md), same hook as above →
  `app/api/push/unsubscribe/route.ts`.
- Mobile: none — see `CROSS-021` (resolved) above.

## Internal (not client-facing)

**`PushNotificationService.sendToUser(userId, title, body?, icon?, data?)`**
([`push-notification.service.ts#L18-L47`](../../../../nest-js-boilerplate/src/push-notification/push-notification.service.ts)) —
called in-process only, never exposed as an endpoint. Fetches every `PushSubscription` row for the
user and calls the `web-push` package's `sendNotification()` against each (VAPID-signed), in
parallel (`Promise.allSettled`). On a `410`/`404` response from a push provider, deletes that
subscription row automatically (expired/unsubscribed-at-the-browser-level). See
[README.md § Who calls sendToUser()](./README.md#who-calls-sendtouser) for both call sites.

## Known issues

- `BE-015` (resolved) — `myPushSubscriptions` has no caller on either platform.
- `CROSS-021` (resolved) — mobile push notifications are non-functional
  end-to-end (targets FCM; this backend only implements Web Push).
- Full findings with severity and evidence are filed in [`issues.md`](../../../issues.md).
