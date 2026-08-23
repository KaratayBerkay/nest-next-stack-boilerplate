# UserSearchCard (component)

**Source:** [`UserSearchCard.tsx`](../../../../../next-js-boilerplate/src/views/find-friends/UserSearchCard.tsx)
**Used in:** [find-friends page](../page.md) — "Add friends" tab, both tiers
**Mobile equivalent:** [UserSearchCard widget](../../../../mobile/v1/find-friends/widgets/user-search-card.md)

## Purpose

Pure presentational row: avatar (initials fallback), name, and either a disabled "pending" badge (when
`isPending`) or an "Add friend" button. No internal state — `isPending` and the send handler are both
props, computed by the parent from `friendRequests`/a local `sentIds` set (so a just-sent request shows
"pending" immediately without waiting for the list to refetch).

## Props

```ts
{ userId, name, isPending, onSendRequest, pendingLabel, addFriendLabel }
```

## Calls

Indirect only — `onSendRequest` is passed in from
[FreeFindFriendsContent/MediumFindFriendsContent](../page.md), which wires it to
`useFriendActions().sendRequest(u.id)`. See [../api.md](../api.md) →
[messaging/endpoints.md#send--accept--decline-a-friend-request](../../../../backend/messaging-realtime/messaging/endpoints.md#send--accept--decline-a-friend-request).
