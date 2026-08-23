# ReactionButtons (widget) — `ReactionInline`

**Source:** [`reaction_buttons.dart`](../../../../../flutter-boilerplate/lib/components/feed/reaction_buttons.dart)
**Used in:** [PostHeader](./post-header.md), [CommentSection](./comment-section.md)
**Web equivalent:** [ReactionButtons component](../../../../frontend/v1/feed/components/reaction-buttons.md)

## Purpose

The same 4-emoji picker as web (`LIKE`/`LOVE`/`LAUGH`/`WOW`) — a leading smiley trigger showing the
total count, and, once at least one reaction exists, a horizontal scrollable row of per-type
count pills. `StatefulWidget` (not `Consumer`-based — this widget takes its data as props and calls
back out, it doesn't read Riverpod providers itself).

## Constructor

```dart
class ReactionInline extends StatefulWidget {
  final String? postId;
  final String? commentId;
  final List<FeedReaction> reactions;
  final String? currentUserId;
  final VoidCallback? onReactionChange;
  final Future<void> Function(String type)? onToggle;
}
```

## Behavior notes

- Unlike web's popover-based picker, all 4 reaction types are shown inline at once (a horizontally
  scrollable `ListView` when the row would overflow) rather than behind a click-to-open popover — a
  deliberate mobile-appropriate layout choice, not a functionality gap.
- On failure, shows a `SnackBar` (`t.feedFailedToReact`) — same error-handling shape as web's toast.

## Calls

`onToggle` is a required-in-practice callback (both real call sites pass it) into the parent's own
`postActionsProvider.toggleReaction()`/`.toggleCommentReaction()` call — see
[PostHeader](./post-header.md#calls) and [CommentSection](./comment-section.md#calls). This widget
makes no `postActionsProvider` call itself; `onToggle` is the only network-triggering path.
