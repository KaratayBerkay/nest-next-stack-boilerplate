# PostCard

**Source:** [`PostCard.tsx`](../../../../../next-js-boilerplate/src/components/feed/PostCard.tsx)
**Types:** [`PostCard-types.ts`](../../../../../next-js-boilerplate/src/types/feed/PostCard-types.ts)
**Used in:** [feed page](../page.md), rendered by `FreeFeedList`/`MediumFeedList`/`PremiumFeedList`
**Mobile equivalent:** [PostCard widget](../../../../mobile/v1/feed/widgets/post-card.md)

## Purpose

Renders one feed post: header (author/reactions/edit/delete), content (title/body, with inline edit
mode), and the comment-toggle + expandable comment thread. Client component (`"use client"`).
Composes three smaller components rather than rendering everything itself —
[PostHeader](./post-header.md), [PostContent](./post-content.md), [PostActions](./post-actions.md).

## Props (`PostCardProps`)

| Prop | Purpose |
|---|---|
| `post` | the initial post row (from the feed list query) |
| `isExpanded` | whether the comment thread is open — controlled by the parent list, not local state |
| `onToggle()` | callback to flip `isExpanded` in the parent |
| `onDelete(postId)` | callback to remove this card from the parent list's local state after a successful delete |

## Behavior notes

- **Re-fetches its own post row.** `useSuspenseQuery(singlePostQueryOptions(post.id))`, seeded with
  the `post` prop as `initialData` and a 30s `staleTime` — so a card starts from the list's data but
  independently refreshes to the single-post query's shape/freshness once stale. This means a card
  can silently pick up fields the list query itself didn't request (e.g. `reactionBreakdown`, if that
  were ever added to `POST_QUERY` — see [FE-009](../../../../issues.md#fe-009)).
- **Inline edit is local to this component** — `editing`/`editTitle`/`editContent` are `useState`
  here, separate from [posts](../../posts/page.md)'s own edit-in-place on the detail page (different
  component, same underlying `updatePost` mutation).
- Both delete and edit invalidate `["posts", postData.id]` on success/via `onRefresh`/`onDelete`, not
  the whole `["feed"]` query tree — the list itself only changes shape when a post is added/removed,
  which `handleDeletePost` (see [hooks.md](../hooks.md)) handles by mutating local list state
  directly rather than a query invalidation.

## Calls

Reads `usePostActions()` directly (not via a prop) for `updatePost`/`deletePost`:

```
PostCard → usePostActions().updatePost() / .deletePost()   — src/api/client/posts/actions.ts
  → updatePostServer() / deletePostServer()                — src/api/server/posts/update.ts, delete.ts
    → backend: updatePost / deletePost mutations
```

- Frontend API layer: [posts/api.md § Update / delete a post](../../posts/api.md#update--delete-a-post-client)
- Backend endpoints: [post/endpoints.md](../../../../backend/social-content/post/endpoints.md#update-a-post),
  [post/endpoints.md](../../../../backend/social-content/post/endpoints.md#delete-a-post)

[PostHeader](./post-header.md)'s reaction button and [PostActions](./post-actions.md)'s comment
thread each call their own actions independently — see those docs' own **Calls** sections.
