# Feed (page)

**Route:** `/v1/[lang]/feed` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/feed/page.tsx)
**Mobile equivalent:** [feed screen](../../../mobile/v1/feed/screen.md)

## What renders here

Server component. Fetches the session user and the first page of the feed **in parallel**
(`graphqlFetch(POSTS_QUERY, {take: 5}, ...)` — the same GraphQL query the client-side query hook
re-fetches from), then hands off to `getTierView()`:

```ts
const VIEWS = { FREE: FreePageView, BASIC: BasicPageView, MEDIUM: MediumPageView, PREMIUM: PremiumPageView };
```

| Tier | View file | Differs from Free by |
|---|---|---|
| Free | [`FreePageView.tsx`](../../../../next-js-boilerplate/src/views/feed/FreePageView.tsx) | — |
| Basic | [`BasicPageView.tsx`](../../../../next-js-boilerplate/src/views/feed/BasicPageView.tsx) | nothing — `export const BasicPageView = FreePageView;` |
| Medium | [`MediumPageView.tsx`](../../../../next-js-boilerplate/src/views/feed/MediumPageView.tsx) | `FeedBaseView` gets `showSidebar` instead of `showPageInfo` (renders [PostStatsSidebar](./components/post-stats-sidebar.md) alongside the list) |
| Premium | [`PremiumPageView.tsx`](../../../../next-js-boilerplate/src/views/feed/PremiumPageView.tsx) | `showSidebar` **and** a 👑 badge on the viewer's own posts (`currentUserId` passed through to the list) |

All four ultimately render the same `FeedBaseView` → `FeedList` composition; the tier split is a
routing convention this codebase applies uniformly across pages (see the same pattern in the
[messages page](../messages/page.md#what-renders-here)), not feed-specific tier logic. The list's
`search`/`sidebar` behavior is the only thing that varies by tier here — **the underlying data isn't
tier-gated** (contrast this with [posts](../posts/page.md), where `reactionBreakdown`/`whoReacted`
really are `TierGuard`-enforced backend fields, not just a frontend view-selection convention).

⚠ **`MediumFeedList.tsx` is a byte-for-byte duplicate of `FreeFeedList.tsx`** (confirmed via `diff`,
zero output) — see [Known issues](#known-issues-affecting-this-page). Where `BasicPageView.tsx`
correctly reuses `FreePageView` by direct export-aliasing, `MediumPageView.tsx` instead maintains a
whole separate, identical copy of the list component that must be hand-kept in sync.

## Client component tree

```
FeedBaseView                              (search box, "Share" button, optional sidebar layout)
└─ FeedList | FeedList (Premium variant)   (infinite-scroll list, one per tier — see above)
    ├─ PostCard                            (× N)
    │   ├─ PostHeader                      (author, timestamp, ReactionInline, edit/delete)
    │   ├─ PostContent                     (title/body, inline edit mode)
    │   └─ PostActions                     (comment-count toggle → CommentSection)
    │       └─ CommentSection              (composer + threaded list, when expanded)
    │           ├─ CommentList → CommentCard (× N, + one level of replies)
    │           └─ (composer input, inline in CommentSection)
    └─ FeedListEmptyState                  (when the list is empty)
```

`PostStatsSidebar` (Medium/Premium only) renders alongside this tree, not inside it — see
[FeedBaseView](#what-renders-here) above.

## Components

9 significant components in
[`src/components/feed/`](../../../../next-js-boilerplate/src/components/feed/) (this folder also
holds `NotificationDropdown.tsx`/`NotificationList.tsx`/`Badge.tsx`, which are **out of scope for
this vertical** — confirmed via grep, their only render site is the app-wide `V1Header.tsx` chrome,
not any page documented here):

[post-card.md](./components/post-card.md) ·
[post-header.md](./components/post-header.md) ·
[post-content.md](./components/post-content.md) ·
[post-actions.md](./components/post-actions.md) ·
[reaction-buttons.md](./components/reaction-buttons.md) ·
[comment-section.md](./components/comment-section.md) (covers `CommentSection`, `CommentList`, and
`CommentComposer` together — the latter two are thin, purely-presentational sub-renderers with no
logic of their own) ·
[comment-card.md](./components/comment-card.md) ·
[post-stats-sidebar.md](./components/post-stats-sidebar.md) ·
[feed-list-empty-state.md](./components/feed-list-empty-state.md)

## Hooks & API

- [hooks.md](./hooks.md) — feed-list pagination/refresh handlers, `usePostHashScroll`; the mutation
  layer itself (`usePostActions`) is documented once, in [posts/api.md](../posts/api.md), and reused
  here
- [api.md](./api.md) — this page's own query wiring (`feedListQueryOptions`); links out to
  [posts/api.md](../posts/api.md) for every create/update/delete/react/comment action, since that
  vertical owns the shared `api/client/posts/` + `api/server/posts/` layer

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| List the feed | [post/endpoints.md#list-the-feed](../../../backend/social-content/post/endpoints.md#list-the-feed) |
| Create / update / delete a post | [post/endpoints.md](../../../backend/social-content/post/endpoints.md) (edit/delete via `PostCard`) |
| Toggle a reaction | [reactions/endpoints.md](../../../backend/social-content/reactions/endpoints.md#create--toggle-a-reaction) |
| Comment create/update/delete | [comment/endpoints.md](../../../backend/social-content/comment/endpoints.md) |
| My post stats (Medium+) | [post/endpoints.md#get-my-post-stats](../../../backend/social-content/post/endpoints.md#get-my-post-stats) |
| Live feed refresh | `renew: 'Feed'` frames over the [realtime](../../../backend/messaging-realtime/realtime/README.md) WebSocket — see [hooks.md](./hooks.md) |

## Known issues affecting this page

- [FE-010](../../../issues.md#fe-010) — `MediumFeedList.tsx` is a byte-for-byte duplicate of
  `FreeFeedList.tsx`; should alias like `BasicPageView.tsx` does instead of maintaining a second
  copy.
