# PostHeader (posts detail)

**Source:** [`PostHeader.tsx`](../../../../../next-js-boilerplate/src/views/posts/[uuid]/PostHeader.tsx)
**Types:** [`PostHeader-types.ts`](../../../../../next-js-boilerplate/src/types/views/posts/PostHeader-types.ts)
**Used in:** [posts detail page](../page.md)

> ⚠ Not to be confused with [`components/feed/PostHeader.tsx`](../../feed/components/post-header.md)
> — a **different component with the same name**, used on the feed page's cards. This doc covers
> only the post-detail-page version.

## Purpose

Larger author identity block (9×9 avatar vs. the feed card's 6×6), [ReactionInline](../../feed/components/reaction-buttons.md),
and — for the post's own author — edit/delete icon buttons (delete behind a `ConfirmDialog`). Same
underlying data and actions as the feed version, different layout/sizing for the detail-page context.

## Props (`PostHeaderProps`)

| Prop | Purpose |
|---|---|
| `post` | the post row |
| `uuid` | the post id, used to build the `["posts", uuid]` invalidation key on reaction change |
| `editing` | suppresses edit/delete while [PostEditForm](./post-edit-form.md) is open |
| `currentUserId` | gates the edit/delete buttons |
| `showPageInfo` | Free tier only — renders the page-info help button here instead of in a page-level header |
| `onStartEdit()`, `onDelete()` | callbacks into `PostDetailContent`'s edit state / delete action |

## Calls

Renders [ReactionInline](../../feed/components/reaction-buttons.md) with `postId`/`post.reactions ??
[]`; `onReactionChange` invalidates `["posts", uuid]` directly (not a callback into the parent).
`onStartEdit`/`onDelete` are plain callbacks — see [page.md](../page.md#what-renders-here) for where
`handleDelete`/`handleStartEdit` actually call
[`usePostActions`](../api.md#update--delete-a-post-client).
