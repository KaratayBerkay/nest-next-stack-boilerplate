# Posts — Hooks

Page: [page.md](./page.md)

This page has exactly one page-specific hook. The data hooks it uses beyond that
(`useSuspenseQuery(singlePostQueryOptions(...))`, `usePostActions()`) are documented once in
[api.md](./api.md), since they're plain React Query/composition calls rather than custom hooks with
their own behavior worth a separate write-up.

### `useMarkPostNotificationsRead`

[Source](../../../../next-js-boilerplate/src/lib/notifications/useMarkPostNotificationsRead.ts) —
on mount and whenever the notifications list changes, finds every unread notification whose
`payload.postId` matches this page's post id and marks each one read
(`markNotificationReadServer`, then invalidates the `["notifications"]` query). This is how opening a
post from a comment/reaction notification clears that notification's unread badge without the user
needing to open the notification panel itself. The notification module that owns
`useNotifications`/`markNotificationReadServer` and the `payload.postId → /posts/{id}` deep-link
resolution (`notificationTarget()`) is out of scope for this vertical — see
[frontend/v1/notification/api.md](../notification/api.md) and
[backend/messaging-realtime/notification/README.md](../../../backend/messaging-realtime/notification/README.md).

## Cross-cutting hooks used here but not posts-specific

`useAuth`, `useRealtime`, `useYSwipeGesture`, `useMessages`, `useDateDisplayCookie` — defined outside
this vertical and shared across pages; documented where first introduced rather than repeated here.
