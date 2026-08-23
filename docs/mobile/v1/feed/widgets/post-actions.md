# PostActions (widget)

**Source:** [`post_actions.dart`](../../../../../flutter-boilerplate/lib/components/feed/post_actions.dart)
**Used in:** [PostCard](./post-card.md)
**Web equivalent:** [PostActions component](../../../../frontend/v1/feed/components/post-actions.md)

## Purpose

The comment-count toggle button; when expanded, watches `postCommentsProvider(postId)` and mounts
[CommentSection](./comment-section.md) once comments load. `ConsumerStatefulWidget` — owns its own
`_isExpanded` bool (unlike web, where expansion state is lifted to the parent list so only one card
can be expanded at a time; here each `PostActions` instance tracks its own, so multiple cards can be
expanded simultaneously on mobile — a real, minor UX difference, not filed as an issue).

## Constructor

```dart
class PostActions extends ConsumerStatefulWidget {
  final Post postData;
  final String? currentUserId;
  final VoidCallback? onCommentAdded;
  final Future<void> Function(String postId, String body, String? parentId)? onCreateComment;
  final Future<void> Function(String commentId, String body)? onUpdateComment;
  final Future<void> Function(String commentId)? onDeleteComment;
  final Future<void> Function(String type, String? postId, String? commentId)? onToggleReaction;
}
```

## Calls

Watches `postCommentsProvider(widget.postData.id)` (`lib/api/client/posts/query.dart`) directly — see
[hooks.md](../hooks.md) — to fetch comments on expand. All create/update/delete/react callbacks are
threaded straight through to [CommentSection](./comment-section.md), which is where the actual
`postActionsProvider` calls happen; this widget makes no mutation calls of its own.
