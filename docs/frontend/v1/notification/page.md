# Notification (page)

**Route:** `/v1/[lang]/notification` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/notification/page.tsx)
**Mobile equivalent:** [notification screen](../../../mobile/v1/notification/screen.md)

## What renders here

Server component. Resolves the session user, then hands off to `getTierView()`, which renders one of
four tier-branch view files based on `user.tier`:

```ts
const VIEWS = { FREE: FreePageView, BASIC: BasicPageView, MEDIUM: MediumPageView, PREMIUM: PremiumPageView };
```

| Tier | View file |
|---|---|
| Free | [`FreePageView.tsx`](../../../../next-js-boilerplate/src/views/notification/FreePageView.tsx) |
| Basic | [`BasicPageView.tsx`](../../../../next-js-boilerplate/src/views/notification/BasicPageView.tsx) |
| Medium | [`MediumPageView.tsx`](../../../../next-js-boilerplate/src/views/notification/MediumPageView.tsx) |
| Premium | [`PremiumPageView.tsx`](../../../../next-js-boilerplate/src/views/notification/PremiumPageView.tsx) |

Same pattern as [messages](../messages/page.md): only `FreePageView` has a real body (`Suspense` +
`ErrorBoundary` around `NotificationPageContent`); `Basic`/`Medium`/`PremiumPageView` are literal
`export const BasicPageView = FreePageView;` re-exports. Nothing about the notification list is
actually tier-gated — the four-file split is purely the `getTierView()` routing convention this
codebase uses uniformly across pages. Not documented as standalone components.

`loading.tsx` renders [`NotificationFallback`](../../../../next-js-boilerplate/src/fallbacks/views/notification/NotificationFallback.tsx),
a dedicated skeleton, for the route-level Suspense boundary Next.js itself manages (separate from the
inner `<Suspense>` in `FreePageView.tsx`, which uses the same fallback component for the client-side
one).

## Client component tree

`NotificationPageContent` uses [`useNotifications`](./hooks.md), [`usePushNotifications`](./hooks.md),
and [`useNotificationActions`](./hooks.md) directly (there is no single page-level state hook the way
[messages](../messages/hooks.md)'s `useMessagesPage` composes everything — this vertical is simple
enough that the page component owns its own state), and renders:

```
NotificationPageContent
├─ NotificationHeader   (back nav, push permission toggle, unread count, "mark all read", page-info)
└─ notification list
    ├─ SkeletonMessage × 5      (loading state)
    ├─ empty state              (no notifications)
    └─ NotificationItem × N     (sorted unread-first, then newest-first)
        └─ "Load more" button   (when hasNextPage)
```

## Components

2 significant components in
[`src/views/notification/`](../../../../next-js-boilerplate/src/views/notification/):

[notification-header.md](./components/notification-header.md) ·
[notification-item.md](./components/notification-item.md)

## Behavior notes

- **Visiting this page marks every notification read, automatically, once.** A `useRef` guard
  (`markedRef`) fires `markAllRead()` unconditionally the first time `notifications.length > 0` after
  mount — not gated on scroll position, visibility, or which items the user actually looked at. There
  is no way to browse the list without immediately losing every item's unread state. Contrast with
  mobile, which has no equivalent auto-effect — see ⚠ [CROSS-023](../../../issues.md#cross-023).
- **Sort order is client-side and unread-first**: `[...notifications].sort(...)` puts unread items
  before read ones, then newest-first within each group — this happens *after* the auto-mark-all-read
  effect has already fired for that render pass, so by the time a user actually looks at the sorted
  list, every item they see freshly loaded is already `readAt`-stamped server-side (the client-side
  "unread" bucketing only reflects what was unread in the snapshot before the mark-all call resolved).
- **Push notification controls live in the header, not this content area** — see
  [notification-header.md](./components/notification-header.md) and [hooks.md](./hooks.md)'s
  `usePushNotifications`.
- **Click-through target per notification** ([`notificationTarget()`](../../../../next-js-boilerplate/src/lib/notifications/target.ts)):
  `payload.kind === 'friend-request' | 'friend-accepted'` → `/v1/${lang}/find-friends/requests`;
  `payload.postId` present → `/v1/${lang}/posts/${postId}` (the [posts detail page](../posts/page.md));
  otherwise (e.g. a `BILLING` notification, which carries no `payload` at all — see
  [backend/notification/README.md § Who creates a notification](../../../backend/messaging-realtime/notification/README.md#who-creates-a-notification-and-when))
  no navigation happens, only the mark-read. ⚠ This is **not** the same target logic the push
  notification's service-worker click handler uses for the same notification kinds — see
  [CROSS-022](../../../issues.md#cross-022).
- **Two swipe gestures, different purposes**: `useYSwipeGesture` (on the list container) is
  click/touch-drag-to-scroll, not pull-to-refresh; `useSwipeGesture` (page-level, `onSwipeLeft`)
  navigates back to `/v1/${lang}/feed` on a leftward swipe, with a live transform/opacity
  transition and a chevron affordance while dragging.
- `useDeviceType()` is called (`const _pointer = ...`) purely for its side effect (toggles
  `touch-device`/`mouse-device` classes on `<html>`, consumed by global CSS) — its return value is
  discarded on this page.

## Hooks & API

- [hooks.md](./hooks.md) — `useNotifications`, `useUnreadNotificationCount`, `useNotificationActions`,
  `usePushNotifications`
- [api.md](./api.md) — full client/server API map (3 client files, 6 BFF route files, all GraphQL
  under the hood)

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| List notifications | [notification/endpoints.md#list-my-notifications](../../../backend/messaging-realtime/notification/endpoints.md#list-my-notifications) |
| Unread count | [notification/endpoints.md#get-unread-notification-count-graphql](../../../backend/messaging-realtime/notification/endpoints.md#get-unread-notification-count-graphql) |
| Mark one / all read | [notification/endpoints.md#mark-one-notification-read](../../../backend/messaging-realtime/notification/endpoints.md#mark-one-notification-read) · [notification/endpoints.md#mark-all-notifications-read](../../../backend/messaging-realtime/notification/endpoints.md#mark-all-notifications-read) |
| Live delivery (new item, count, mark-all-read sync) | [realtime/endpoints.md](../../../backend/messaging-realtime/realtime/endpoints.md), [notification/README.md § Live delivery over realtime](../../../backend/messaging-realtime/notification/README.md#live-delivery-over-realtime) |
| Push subscribe / unsubscribe | `push-notification/`'s `subscribePush`/`unsubscribePush` GraphQL mutations — source: [`push-subscription.resolver.ts`](../../../../nest-js-boilerplate/src/push-notification/push-subscription.resolver.ts). No `endpoints.md` exists for this module in this pass (it's a parallel phase's module) — see [notification/README.md § Known issues](../../../backend/messaging-realtime/notification/README.md#known-issues) |

## Known issues affecting this page

- ⚠ [CROSS-022](../../../issues.md#cross-022) — the in-app click target above and the push notification's
  service-worker click target disagree for the same notification kinds.
- ⚠ [CROSS-023](../../../issues.md#cross-023) — this page auto-marks every notification read on first load;
  mobile requires an explicit tap.
- ⚠ [FE-011](../../../issues.md#fe-011) — a second, dead implementation of mark-read
  (`useMarkNotificationRead`) sits unused alongside the real one this page calls — see
  [hooks.md](./hooks.md).
