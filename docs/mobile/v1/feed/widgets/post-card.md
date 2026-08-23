# PostCard (widget)

**Source:** [`post_card.dart`](../../../../../flutter-boilerplate/lib/components/feed/post_card.dart)
**Used in:** [feed screen](../screen.md)
**Web equivalent:** [PostCard component](../../../../frontend/v1/feed/components/post-card.md)

## Purpose

`ConsumerWidget` composing [PostHeader](./post-header.md), [PostContent](./post-content.md), and
[PostActions](./post-actions.md) into one `Card` — the mobile feed's per-post render, same 3-widget
split as web's equivalent.

## Constructor

```dart
class PostCard extends ConsumerWidget {
  final Post post;
  final String lang;
  const PostCard({super.key, required this.post, required this.lang});
}
```

## Behavior notes vs. web

- **No local edit/re-fetch state** — unlike web's `PostCard`, which re-fetches its own post row via
  `useSuspenseQuery` seeded from the list data, this widget just renders the `post` prop as-is.
- All callbacks this widget itself wires (`onToggleReaction`, `onCreateComment`, `onUpdateComment`,
  `onDeleteComment`) are threaded down to [PostHeader](./post-header.md)/[PostActions](./post-actions.md).
- ⚠ **`onEditStart`/`onDeleteConfirm`/`onRefresh` are never passed to
  [PostHeader](./post-header.md) at all** — only `isOwn`, `currentUserId`, `onViewPost`, and
  `onToggleReaction` are. See [PostHeader § Known issues](./post-header.md#known-issues) for the
  resulting bug (a post author's edit/delete controls render but don't work on this screen).

## Calls

```
PostCard (wires callbacks) → postActionsProvider.toggleReaction() / .addComment() / .updateComment()
  / .deleteComment() / .toggleCommentReaction()
  — lib/api/client/posts/actions.dart
```

- Frontend-equivalent API layer: [api.md](../api.md)
- Backend endpoints: [reactions/endpoints.md](../../../../backend/social-content/reactions/endpoints.md#create--toggle-a-reaction),
  [comment/endpoints.md](../../../../backend/social-content/comment/endpoints.md)

`postActionsProvider.update()`/`.delete()` (post edit/delete) are **not** called anywhere in this
widget's tree — see [PostHeader § Known issues](./post-header.md#known-issues).
