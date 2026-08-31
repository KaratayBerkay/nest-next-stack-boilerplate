# Friends (page)

**Route:** `/v1/[lang]/friends` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/friends/page.tsx)
**Mobile equivalent:** [friends screen](../../../mobile/v1/friends/screen.md)

## What renders here

Same `getTierView()` pattern as [messages](../messages/page.md): `getSessionUser()` server-side, then
one of four tier-branch view files based on `user.tier`. Unlike
[find-friends](../find-friends/page.md), there's **no real tier differentiation** here — all four
files resolve to the exact same content:

```ts
// views/friends/BasicPageView.tsx
export const BasicPageView = FreePageView;
// views/friends/MediumPageView.tsx
export const MediumPageView = FreePageView;
// views/friends/PremiumPageView.tsx
export const PremiumPageView = MediumPageView; // → FreePageView, transitively
```

| Tier | View file |
|---|---|
| Free | [`FreePageView.tsx`](../../../../next-js-boilerplate/src/views/friends/FreePageView.tsx) — the only one with real content |
| Basic / Medium / Premium | thin re-exports of `FreePageView`, see above |

`FreePageView` itself is a thin client-side auth/loading gate
(`useAuth()` → `LoadingAuth`/`UnauthenticatedMessage`) wrapping the real content in a `Suspense`
boundary with [`FriendsPageSkeleton`](../../../../next-js-boilerplate/src/views/friends/FriendsPageSkeleton.tsx)
(trivial loading skeleton, not documented separately) as fallback.

## `FriendsPageContent` — the real content

[`FriendsPageContent.tsx`](../../../../next-js-boilerplate/src/views/friends/FriendsPageContent.tsx) —
a single client component, no page-specific hook (see [Hooks & API](#hooks--api) below). Fetches the
friends list with `useSuspenseQuery(friendsQueryOptions())` and renders either an
[`Empty`](../../../../next-js-boilerplate/src/components/ui/Empty.tsx) state ("no friends yet" +
a button to find-friends) or a single `Card` of clickable rows, one per friend: avatar, name (falls
back to email if no name), email (only shown as a second line when it differs from the name), and a
"Message" badge. Clicking a row navigates to `/v1/en/messages?user={friendId}` — see
[Known issues](#known-issues), that `en` is not a typo in this doc.

## Hooks & API

No vertical-specific hook file — `FriendsPageContent` calls `friendsQueryOptions()` directly (defined
in [`src/api/client/friends/query.ts`](../../../../next-js-boilerplate/src/api/client/friends/query.ts),
shared with [find-friends](../find-friends/page.md), see [api.md](./api.md)). Cross-cutting hooks used
here but not friends-specific: `useAuth` ([auth](../../auth/hooks.md)), `useRouter`
(Next.js), `useMessages` (i18n).

- [api.md](./api.md) — `friendsQueryOptions()` and what it actually calls (it isn't a dedicated
  friends BFF route — see below)

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| List friends | [messaging/endpoints.md#list-friends](../../../backend/messaging-realtime/messaging/endpoints.md#list-friends) — implemented in the `messaging/` module, not `friends/`; see [social-content/friends/README.md](../../../backend/social-content/friends/README.md) for the disambiguation |

This page does **not** call `social-content/friends/`'s own `suggestedFriends` query — that's
[find-friends](../find-friends/page.md)-only (Medium+ tier).

## Known issues

- `FE-008` (resolved) — all three navigation actions on this page
  (`FriendsPageContent.tsx#L32,49,60`) hardcode `/v1/en/...` instead of the current locale, unlike
  every other page in this vertical family (`find-friends`, `settings/*`) which correctly derive the
  active `lang` from routing. A non-English user clicking "Find friends" or any friend row on this
  page is silently bounced to the English-locale URL. Mobile's equivalent
  (`friends_page_content.dart`) does this correctly, which is how the gap was noticed.
