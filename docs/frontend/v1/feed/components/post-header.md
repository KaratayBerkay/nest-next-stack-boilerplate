# PostHeader (feed)

**Source:** [`PostHeader.tsx`](../../../../../next-js-boilerplate/src/components/feed/PostHeader.tsx)
**Types:** [`PostHeader-types.ts`](../../../../../next-js-boilerplate/src/types/feed/PostHeader-types.ts)
**Used in:** [PostCard](./post-card.md)
**Mobile equivalent:** [PostHeader widget](../../../../mobile/v1/feed/widgets/post-header.md)

> ⚠ Not to be confused with [`views/posts/[uuid]/PostHeader.tsx`](../../posts/components/post-header.md)
> — a **different component with the same name**, used on the post-detail page. This doc covers only
> the feed-card version.

## Purpose

Author identity (avatar-initial + name + relative timestamp), a [ReactionInline](./reaction-buttons.md)
button, a "view post" link to the detail page, and — for the post's own author — edit/delete icon
buttons with a confirm dialog on delete. Client component.

## Props (`PostHeaderProps`)

| Prop | Purpose |
|---|---|
| `postData` | the post row |
| `isOwn` | whether the viewer is the author — gates the edit/delete buttons |
| `editing` | suppresses edit/delete while [PostCard](./post-card.md) is already in edit mode |
| `onRefresh()` | passed straight through as `ReactionInline`'s `onReactionChange` |
| `onEditStart()`, `onDeleteConfirm()` | callbacks into `PostCard`'s local edit state / delete action |

## Behavior notes

- The "view post" link (`IconEye`) always points to `/v1/{lang}/posts/{postData.id}` — the only
  place in this component tree that links out to the [posts](../../posts/page.md) detail page.
- Delete goes through [`ConfirmDialog`](../../../../../next-js-boilerplate/src/components/ui/ConfirmDialog.tsx)
  (shared UI primitive) — no server-side confirmation step, the dialog is the only guard.

## Calls

Renders [ReactionInline](./reaction-buttons.md) with `postId`/`reactions` from `postData` — see that
doc for the actual mutation call. `onEditStart`/`onDeleteConfirm` are plain callbacks into
[PostCard](./post-card.md#calls), not direct API calls from this component.
