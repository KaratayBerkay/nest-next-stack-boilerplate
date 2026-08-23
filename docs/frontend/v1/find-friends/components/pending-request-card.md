# PendingRequestCard (component)

**Source:** [`PendingRequestCard.tsx`](../../../../../next-js-boilerplate/src/views/find-friends/PendingRequestCard.tsx)
**Used in:** [find-friends page](../page.md) — "Pending requests" tab, both tiers
**Mobile equivalent:** [PendingRequestCard widget](../../../../mobile/v1/find-friends/widgets/pending-request-card.md)

## Purpose

Pure presentational row for one pending friend request, either direction:

- `direction === "incoming"` — renders Accept + Decline buttons.
- `direction === "outgoing"` — renders a static "sent by you" label next to the name and an
  "awaiting" badge instead of any action (you can't accept/decline your own outgoing request).

No internal state; `onAccept`/`onDecline` are props called with `user.id` (the *other* party's id, not
the request row's own `id` — the backend's accept/decline routes are keyed by the other user's id, see
[messaging/endpoints.md#send--accept--decline-a-friend-request](../../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request)).

## Props

```ts
{ request: FriendRequest, onAccept, onDecline, sentByYouLabel, acceptLabel, declineLabel, awaitingLabel }
```

## Calls

Indirect only — `onAccept`/`onDecline` are wired by the parent to
`useFriendActions().acceptRequest`/`.declineRequest`. See [../api.md](../api.md) →
[messaging/endpoints.md#send--accept--decline-a-friend-request](../../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request).
