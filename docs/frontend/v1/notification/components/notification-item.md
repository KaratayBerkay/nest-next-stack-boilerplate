# NotificationItem

**Source:** [`NotificationItem.tsx`](../../../../../next-js-boilerplate/src/views/notification/NotificationItem.tsx)
**Types:** [`NotificationItem-types.ts`](../../../../../next-js-boilerplate/src/types/views/notification/NotificationItem-types.ts)
**Used in:** [notification page](../page.md), and independently by
[`NotificationDropdown`](../../../../../next-js-boilerplate/src/components/feed/NotificationDropdown.tsx)'s
[`NotificationList`](../../../../../next-js-boilerplate/src/components/feed/NotificationList.tsx) (a
different rendering, not this component reused — see Behavior notes)
**Mobile equivalent:** [NotificationItem widget](../../../../mobile/v1/notification/widgets/notification-item.md)

## Purpose

Renders one row: a letter-avatar (actor's first initial, not an image — see Behavior notes),
title/body/relative-time, and an unread dot. The whole row is a `<button>` — there's no separate
"mark read" affordance, tapping anywhere marks it read and navigates.

## Props (`NotificationItemProps`)

| Prop | Purpose |
|---|---|
| `notification` | the item (`id`, `type`, `title`, `body`, `readAt?`, `payload`, `createdAt`, `actor`) |
| `onRead(id)` | called first, unconditionally, on click |
| `onNavigate(target)` | called only if [`notificationTarget()`](../../../../../next-js-boilerplate/src/lib/notifications/target.ts) resolves a non-null path for this item's `payload` |
| `lang` | passed through to `notificationTarget()` |
| `dateDisplay` | pre-resolved date-format preference, passed to `formatDateByPreference` |

## Behavior notes

- **Renders an initial, not an avatar image** — `n.actor?.name?.charAt(0).toUpperCase() ?? "?"` in a
  solid-color circle. This is why the frontend's GraphQL query for this list
  ([api.md § List notifications (BFF route)](../api.md#list-notifications-bff-route)) doesn't select
  `actor.avatarUrl` at all — there's nothing here that would render it. This is also why
  [CROSS-020](../../../../issues.md#cross-020)'s `hideAvatar` redaction gap has no visible effect through
  *this* component today, even though the underlying GraphQL resolver has the gap.
- **Click handler order matters**: `onRead` fires before the target is even computed, so a
  notification is always marked read the instant it's tapped, regardless of whether a navigation
  target exists (e.g. a `BILLING` notification — no `payload`, no target — still gets marked read on
  tap, it just doesn't go anywhere).
- Unread state styling is a single `bg-brand/5` background tint plus a small dot — no bold-vs-regular
  text weight distinction (contrast with the [mobile widget](../../../../mobile/v1/notification/widgets/notification-item.md),
  which does bold unread titles).

## Calls (indirect — this component never calls a hook's mutation directly)

`onRead`/`onNavigate` are supplied by `NotificationPageContent`
([page.md](../page.md#client-component-tree)) and resolve to:

```
NotificationItem (onRead prop)
  → NotificationPageContent's markRead → useNotificationActions().markRead()  — src/api/client/notifications/actions.ts
    → markNotificationReadServer()                                            — src/api/server/notifications/mark-read.ts
      → backend: GraphQL markNotificationRead(id)
```

- Frontend BFF route: [api.md § Mark read (BFF route)](../api.md#mark-read-bff-route)
- Backend endpoint: [notification/endpoints.md#mark-one-notification-read](../../../../backend/messaging-realtime/notification/endpoints.md#mark-one-notification-read)

`onNavigate` is a plain `router.push(target)` — no further network call.
