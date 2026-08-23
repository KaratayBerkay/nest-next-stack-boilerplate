# CommentSection (widget)

**Source:** [`comment_section.dart`](../../../../../flutter-boilerplate/lib/components/feed/comment_section.dart)
**Used in:** [PostActions](./post-actions.md)
**Web equivalent:** [CommentSection component](../../../../frontend/v1/feed/components/comment-section.md)
(covers web's `CommentSection`+`CommentList`+`CommentComposer`+`CommentCard` — mobile consolidates
all four into this one file, via a private `_CommentTile` widget for the per-comment render)

## Purpose

Composer (text field + send/reply button), then the threaded comment list — one level of replies,
each rendered by the private `_CommentTile` class in this same file. Owns all comment-thread state
directly (`_bodyController`, `_editController`, `_replyTo`, `_submitting`, `_editingId`) — no
separate list/card/composer widget split like web has, matching the real source structure 1:1 (hence
one doc, not four).

## Constructor

```dart
class CommentSection extends StatefulWidget {
  final String postId;
  final List<Comment> comments;
  final String? currentUserId;
  final VoidCallback? onCommentAdded;
  final Future<void> Function(String postId, String body, String? parentId)? onCreateComment;
  final Future<void> Function(String commentId, String body)? onUpdateComment;
  final Future<void> Function(String commentId)? onDeleteComment;
  final Future<void> Function(String type, String? postId, String? commentId)? onToggleReaction;
}
```

## Behavior notes vs. web

- **No optimistic comment insertion** — unlike web's `CommentSection`, which inserts a temporary
  `pending` comment into local state immediately on submit, this widget's `_handleSubmit` clears the
  composer and awaits the real network call before anything changes visibly; the new comment only
  appears once `onCommentAdded` triggers a provider refetch. A slower-feeling submit than web's, not
  a broken one.
- Replies are capped at one level, with an explicit comment in source noting this matches web: *"a
  reply-to-a-reply would save server-side but render nowhere, so the Reply affordance is hidden
  here"* — same backend model both platforms share, see
  [comment/README.md](../../../../backend/social-content/comment/README.md#what-this-module-owns).
- Delete goes through a real `AlertDialog` confirm here (unlike feed's post-level delete bug — see
  [PostHeader § Known issues](./post-header.md#known-issues) — this widget's own
  `onDeleteComment`/`onEditComment` callbacks **are** correctly wired by every real caller, confirmed
  via [PostActions](./post-actions.md) and [CommentSection (web's posts-detail
  equivalent)](../../../../frontend/v1/feed/components/comment-section.md)).

## Calls

```
_CommentTile (composer submit / edit save / delete) → widget.onCreateComment / onUpdateComment / onDeleteComment
  → postActionsProvider.addComment() / .updateComment() / .deleteComment()   — lib/api/client/posts/actions.dart
    → backend: createComment / updateComment / deleteComment mutations
```

- API layer: [api.md](../api.md)
- Backend endpoints: [comment/endpoints.md](../../../../backend/social-content/comment/endpoints.md)

Renders [ReactionInline](./reaction-buttons.md) per comment/reply — see that doc for the reaction
toggle call.
