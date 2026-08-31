# Posts (page)

**Route:** `/v1/[lang]/posts/[uuid]` (dynamic `uuid` segment; the doc folder is named `posts` per
[conventions.md § 1](../../../conventions.md#1-folder-structure-rule) — dynamic segments aren't
reproduced as literal bracket folders) · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/posts/[uuid]/page.tsx)
**Mobile equivalent:** [posts detail screen](../../../mobile/v1/posts/detail/screen.md) — ⚠ mobile
also has two screens with **no** web equivalent, [list](../../../mobile/v1/posts/list/screen.md) and
[create](../../../mobile/v1/posts/create/screen.md); see [mobile/v1/posts/README.md](../../../mobile/v1/posts/README.md).

## What renders here

Server component. Resolves the session user and the full post (via `POST_QUERY`, including comments)
in parallel; calls Next.js `notFound()` if the GraphQL response has errors or no `post` — the one
page in this vertical with a real 404 path. `generateMetadata` makes a second, separate,
unauthenticated `graphqlFetch` for just `{title, content}` (SEO/social-preview metadata, swallows
errors to a generic `"Post"` title). Then `getTierView()`:

```ts
const VIEWS = { FREE: FreePageView, BASIC: BasicPageView, MEDIUM: MediumPageView, PREMIUM: PremiumPageView };
```

| Tier | View file | `PostDetailBaseView` props |
|---|---|---|
| Free | [`FreePageView.tsx`](../../../../next-js-boilerplate/src/views/posts/[uuid]/FreePageView.tsx) | `showPageInfo` |
| Basic | [`BasicPageView.tsx`](../../../../next-js-boilerplate/src/views/posts/[uuid]/BasicPageView.tsx) | none — `export const BasicPageView = FreePageView;` |
| Medium | [`MediumPageView.tsx`](../../../../next-js-boilerplate/src/views/posts/[uuid]/MediumPageView.tsx) | `showReactionBreakdown` |
| Premium | [`PremiumPageView.tsx`](../../../../next-js-boilerplate/src/views/posts/[uuid]/PremiumPageView.tsx) | `showReactionBreakdown` **and** `showWhoReacted` |

**Unlike [feed](../feed/page.md), this tiering is not just a routing convention — it mirrors a real
backend gate.** `reactionBreakdown`/`whoReacted` are genuine `@MinTier`-guarded GraphQL
`@ResolveField`s (see
[post/README.md § Tier gating is real here](../../../backend/social-content/post/README.md#tier-gating-is-real-here-unlike-some-other-verticals)).
⚠ **In practice, neither ever renders anything** — see [Known issues](#known-issues) below.

## Client component tree

All four tier views wrap the same `PostDetailBaseView` (itself wrapped in `Suspense`+`ErrorBoundary`):

```
PostDetailBaseView
└─ PostDetailContent
    ├─ PostHeader                          (author, reactions, edit/delete — this page's own version)
    ├─ PostEditForm | PostContentView       (edit mode toggle)
    ├─ ReactionBreakdown                    (Medium+, when showReactionBreakdown)
    ├─ WhoReacted                           (Premium, when showWhoReacted)
    └─ CommentSection                       (shared with feed — see feed/components/comment-section.md)
```

## Components

5 significant components in
[`src/views/posts/[uuid]/`](../../../../next-js-boilerplate/src/views/posts/[uuid]/) (this doc's own
`components/` folder — the real source folder has no further nesting):

[post-header.md](./components/post-header.md) ·
[post-content-view.md](./components/post-content-view.md) ·
[post-edit-form.md](./components/post-edit-form.md) ·
[reaction-breakdown.md](./components/reaction-breakdown.md) ·
[who-reacted.md](./components/who-reacted.md)

[CommentSection](../feed/components/comment-section.md) is reused here unchanged — documented once,
under [feed](../feed/page.md), not duplicated.

## Hooks & API

- [hooks.md](./hooks.md) — `useMarkPostNotificationsRead` (this page's one page-specific hook)
- [api.md](./api.md) — the full owning doc for `api/client/posts/` + `api/server/posts/` +
  `app/api/posts,comments,reactions/**` — [feed](../feed/api.md) and [share](../share/api.md) both
  link back here for the actions they share with this page

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Get a single post (+ comments, + reactions) | [post/endpoints.md#get-a-single-post](../../../backend/social-content/post/endpoints.md#get-a-single-post) |
| Update / delete a post | [post/endpoints.md](../../../backend/social-content/post/endpoints.md) |
| Toggle a reaction | [reactions/endpoints.md](../../../backend/social-content/reactions/endpoints.md#create--toggle-a-reaction) |
| Comment create/update/delete | [comment/endpoints.md](../../../backend/social-content/comment/endpoints.md) |
| Reaction breakdown (Medium+) | [post/endpoints.md#postreactionbreakdown-resolved-field](../../../backend/social-content/post/endpoints.md#postreactionbreakdown-resolved-field) — ⚠ see Known issues |
| Who reacted (Premium) | [post/endpoints.md#postwhoreacted-resolved-field](../../../backend/social-content/post/endpoints.md#postwhoreacted-resolved-field) — ⚠ see Known issues |
| Live post refresh | `renew: 'Feed'` frames scoped to the `post:{id}` topic — see [realtime/README.md](../../../backend/messaging-realtime/realtime/README.md) |

## Known issues

- `FE-009` (resolved) — `POST_QUERY` (used by both this page's SSR fetch and the
  client-side `fetchSinglePostServer`/`singlePostQueryOptions`, the **only** query this vertical uses
  to load a single post) never selects `reactionBreakdown` or `whoReacted`. Both fields are real,
  working, `TierGuard`-enforced backend resolve fields — see
  [post/endpoints.md](../../../backend/social-content/post/endpoints.md#postreactionbreakdown-resolved-field)
  — but since the query never asks for them, `post.reactionBreakdown`/`post.whoReacted` are always
  `undefined` on the client, and both
  [ReactionBreakdown](./components/reaction-breakdown.md)/[WhoReacted](./components/who-reacted.md)
  early-return `null` on an empty/missing array. **Net effect: Medium and Premium tier viewers see
  nothing different from Basic** on this page today, despite the tier-branch UI, the backend gate,
  and the display components all being fully built. One-line fix (add both fields to `POST_QUERY` in
  [`src/lib/graphql/queries.ts`](../../../../next-js-boilerplate/src/lib/graphql/queries.ts)).
