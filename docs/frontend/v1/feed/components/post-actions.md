# PostActions

**Source:** [`PostActions.tsx`](../../../../../next-js-boilerplate/src/components/feed/PostActions.tsx)
**Types:** [`PostActions-types.ts`](../../../../../next-js-boilerplate/src/types/feed/PostActions-types.ts)
**Used in:** [PostCard](./post-card.md)

## Purpose

The comment-count toggle button, and — when expanded — mounts [CommentSection](./comment-section.md)
inside a scrollable, height-capped (`60vh`) panel. Client component, no state of its own beyond what
it receives (`isExpanded` is controlled by [PostCard](./post-card.md), lifted up so the parent list
can track which card is expanded).

## Props (`PostActionsProps`)

| Prop | Purpose |
|---|---|
| `isExpanded` | whether the comment panel is shown |
| `postData` | the post row (for `_count.comments` / `comments` length display) |
| `onToggle()` | flips `isExpanded` in the parent |
| `currentUserId` | passed straight through to `CommentSection` |
| `onCommentAdded()` | passed straight through to `CommentSection` |

## Calls

None directly — delegates entirely to [CommentSection](./comment-section.md), which owns the actual
create/update/delete/reaction API calls for comments.
