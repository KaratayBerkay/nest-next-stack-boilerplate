# NotificationHeader

**Source:** [`NotificationHeader.tsx`](../../../../../next-js-boilerplate/src/views/notification/NotificationHeader.tsx)
**Types:** [`NotificationHeader-types.ts`](../../../../../next-js-boilerplate/src/types/views/notification/NotificationHeader-types.ts)
**Used in:** [notification page](../page.md)

## Purpose

The page's top bar: back-to-feed button, title, push-notification permission toggle, unread count +
"mark all read" link, and a page-info popover. Purely presentational — every piece of state and every
action is passed in as props from `NotificationPageContent`.

## Props (`NotificationHeaderProps`)

| Prop | Purpose |
|---|---|
| `title` | i18n page title |
| `supported`, `permission`, `subscription` | from [`usePushNotifications`](../hooks.md#usepushnotifications) — whether the browser supports Web Push, the current `Notification.permission`, and the active `PushSubscription` (if any) |
| `requestPermission`, `unsubscribe` | the two push actions, also from `usePushNotifications` |
| `unreadCount` | drives whether the "mark all read" link renders at all |
| `markAllRead`, `markAllReadLabel` | from [`useNotificationActions`](../hooks.md#usenotificationactions) |
| `enablePushLabel`, `disablePushLabel` | i18n strings for the two push-toggle button states |
| `navigateToFeed` | back-button handler (`router.push` to `/v1/${lang}/feed`) |

## Behavior notes

- **Two independent conditions gate the two push buttons**, not a single three-state toggle: the
  "enable" button shows when `supported && permission !== "granted"`; the "disable" button shows when
  `subscription` is truthy. Both can be visible in the same render in the unusual case `permission`
  was reset without `subscription` clearing, or vice versa — the component doesn't reconcile that.
- The icon choice is intentionally inverted from the action: a bell-*off* icon labels the "enable
  push" action (representing the *current* off state) and a bell-*on* icon labels "disable push"
  (representing the current *on* state) — the icon shows current state, the label shows the action.
- "Mark all read" only renders when `unreadCount > 0` — but per
  [page.md § Behavior notes](../page.md#behavior-notes), by the time a user can see this button, the
  page's own mount effect has usually already fired `markAllRead()` once, so this button is mostly
  reachable only for notifications that arrived live *after* that initial auto-mark-read fired.

## Calls

No direct API calls — every action is a prop. See [hooks.md](../hooks.md) for where
`requestPermission`/`unsubscribe`/`markAllRead` actually resolve to a network call:

- Push: [api.md § Push subscribe / unsubscribe](../api.md#push-subscribe--unsubscribe) → backend
  `push-notification/`'s `subscribePush`/`unsubscribePush` (source:
  [`push-subscription.resolver.ts`](../../../../../nest-js-boilerplate/src/push-notification/push-subscription.resolver.ts) —
  no `endpoints.md` in this pass, see
  [backend/notification/README.md § Known issues](../../../../backend/messaging-realtime/notification/README.md#known-issues))
- Mark all read: [api.md § Mark read (BFF route)](../api.md#mark-read-bff-route) → backend
  [notification/endpoints.md#mark-all-notifications-read](../../../../backend/messaging-realtime/notification/endpoints.md#mark-all-notifications-read)
