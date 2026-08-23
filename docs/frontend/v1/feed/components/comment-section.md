# CommentSection (`CommentSection`, `CommentList`, `CommentComposer`)

**Source:** [`CommentSection.tsx`](../../../../../next-js-boilerplate/src/components/feed/CommentSection.tsx),
[`CommentList.tsx`](../../../../../next-js-boilerplate/src/components/feed/CommentList.tsx),
[`CommentComposer.tsx`](../../../../../next-js-boilerplate/src/components/feed/CommentComposer.tsx)
**Types:** [`CommentSection-types.ts`](../../../../../next-js-boilerplate/src/types/feed/CommentSection-types.ts),
[`CommentList-types.ts`](../../../../../next-js-boilerplate/src/types/feed/CommentList-types.ts),
[`CommentComposer-types.ts`](../../../../../next-js-boilerplate/src/types/feed/CommentComposer-types.ts)
**Used in:** [PostActions](./post-actions.md) (feed), [posts detail page](../../posts/page.md)
**Mobile equivalent:** [CommentSection widget](../../../../mobile/v1/feed/widgets/comment-section.md)
(a single file on mobile — these three web files are documented together here for the same reason)

## Purpose

`CommentSection` owns all comment-thread state and the create/edit/delete mutations; `CommentList`
is a thin, stateless renderer that splits its `comments` prop into top-level vs. one-level-deep
replies and delegates each to [CommentCard](./comment-card.md); `CommentComposer` is a plain
controlled `<input>` + submit button with a "cancel reply" affordance when `replyTo` is set — neither
sub-component has any logic of its own, hence documented together rather than as 3 separate pages.

## Props (`CommentSectionProps`)

| Prop | Purpose |
|---|---|
| `postId` | target for new top-level comments |
| `comments` | the post's comment list (top-level + replies, flat — `CommentList` does the tree split) |
| `currentUserId` | whose comments count as "own" (enables edit/delete) |
| `onCommentAdded()` | callback after any successful create/update/delete |

## Behavior notes

- **Optimistic comment insertion**: on submit, a temporary comment (`id: "opt-{n}"`, author name
  `"You"`) is inserted into local `pendingComments` state immediately, before the network call
  resolves — removed on both success and failure (on failure, the composer's text and `replyTo`
  target are restored so the user doesn't lose their draft).
- **Inline edit/delete are also optimistic-local**: `localEdits`/`localDeletes` overlay the `comments`
  prop rather than waiting for `onCommentAdded`'s invalidation to round-trip — a delete rolls back
  (removes itself from `localDeletes`) on failure since there's no server confirmation to wait for.
- **Replies are capped at one level** in the UI (`CommentList` only ever looks up
  `replies(comment.id)` for top-level comments, never recurses) — matches the backend's own
  one-level-reply model, see
  [comment/README.md](../../../../backend/social-content/comment/README.md#what-this-module-owns).
  The reply button is hidden on the commenter's own comments (`!isOwn`) and on replies themselves
  (`isReply` suppresses `onToggleReply`).

## Calls

```
CommentComposer (submit) → CommentSection.handleSubmitComment → usePostActions().createComment()
CommentCard (edit save)  → CommentSection.handleSaveEdit      → usePostActions().updateComment()
CommentCard (delete)     → CommentSection.handleDeleteComment → usePostActions().deleteComment()
  — all three: src/api/client/posts/actions.ts
  → createCommentServer() / updateCommentServer() / deleteCommentServer()
    — src/api/server/posts/comments.ts
    → backend: createComment / updateComment / deleteComment mutations
```

- Frontend API layer: [posts/api.md § Comments](../../posts/api.md#comments-client)
- Backend endpoints: [comment/endpoints.md](../../../../backend/social-content/comment/endpoints.md)

Reaction toggling on an individual comment is [CommentCard](./comment-card.md)'s own concern (via
[ReactionInline](./reaction-buttons.md)), not this component's.
