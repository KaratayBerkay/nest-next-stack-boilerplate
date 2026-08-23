# CommentCard

**Source:** [`CommentCard.tsx`](../../../../../next-js-boilerplate/src/components/feed/CommentCard.tsx)
**Types:** [`CommentCard-types.ts`](../../../../../next-js-boilerplate/src/types/feed/CommentCard-types.ts)
**Used in:** [CommentSection](./comment-section.md) (via `CommentList`)

## Purpose

Renders one comment or reply: author, relative timestamp, [ReactionInline](./reaction-buttons.md),
a Reply button (top-level, non-own comments only), and — for the comment's own author — inline
edit/delete. Client component; all mutation calls are lifted to
[CommentSection](./comment-section.md), this component only fires the callbacks it's given.

## Props (`CommentCardProps`)

| Prop | Purpose |
|---|---|
| `comment` | the comment/reply row |
| `isOwn`, `isReply` | gate which action buttons show |
| `editing`, `editingBody`, `onEditingBodyChange` | inline-edit controlled state (owned by `CommentSection`) |
| `onToggleReply` | `null` when this card is itself a reply (no reply-to-reply UI) |
| `onStartEdit`, `onSaveEdit`, `onCancelEdit`, `onDelete` | callbacks into `CommentSection` |
| `currentUserId`, `onCommentAdded`, `dateDisplay` | passed through to `ReactionInline` / date formatting |

## Behavior notes

- Edit mode swaps the body text for a single-line `<input>` (not a textarea — a comment body can't
  gain newlines through this UI) with `Enter`-to-save / `Escape`-to-cancel keyboard handling.
- Delete is a plain click, no confirm dialog — contrast with [PostHeader](./post-header.md)'s
  post-delete, which does use `ConfirmDialog`. A comment delete is one click away on this platform.

## Calls

Renders [ReactionInline](./reaction-buttons.md) with `commentId`/`comment.reactions ?? []`. All
other actions (`onStartEdit`/`onSaveEdit`/`onCancelEdit`/`onDelete`/`onToggleReply`) are callbacks
into [CommentSection](./comment-section.md#calls) — see that doc for the actual mutation calls.
