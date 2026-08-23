# PostHeader (widget)

**Source:** [`post_header.dart`](../../../../../flutter-boilerplate/lib/components/feed/post_header.dart)
**Used in:** [PostCard](./post-card.md)
**Web equivalent:** [PostHeader component](../../../../frontend/v1/feed/components/post-header.md)

## Purpose

Author avatar/name/relative-timestamp, a [ReactionInline](./reaction-buttons.md), a "view post"
icon button, and — for the post's own author — edit/delete icon buttons behind a delete-confirm
`AlertDialog`.

## Constructor

```dart
const PostHeader({
  super.key,
  required this.postData,
  this.isOwn = false,
  this.editing = false,
  this.currentUserId,
  this.onRefresh,
  this.onEditStart,
  this.onDeleteConfirm,
  this.onViewPost,
  this.onToggleReaction,
});
```

All fields except `postData` are optional/defaulted — `isOwn`/`editing` default `false`,
`onRefresh`/`onEditStart`/`onDeleteConfirm`/`onViewPost`/`onToggleReaction` default `null`.

## Known issues

**On the feed screen specifically, the edit button is permanently disabled and the delete button's
confirm dialog is a no-op.** [PostCard](./post-card.md) (this widget's only instantiation site,
confirmed via `grep -rn "PostHeader(" flutter-boilerplate/lib/components`) never passes
`onEditStart`/`onDeleteConfirm`/`onRefresh` — only `isOwn`, `currentUserId`, `onViewPost`,
`onToggleReaction`. Since Dart's `IconButton.onPressed` renders **disabled** (greyed out, untappable)
when given a `null` callback, and this widget's edit button uses `onPressed: onEditStart` directly:

```dart
if (isOwn && !editing) ...[
  IconButton(icon: Icon(Icons.edit_outlined, ...), onPressed: onEditStart, ...),  // null → disabled
  IconButton(
    icon: Icon(Icons.delete_outline, ...),
    onPressed: () async {
      final confirmed = await showDialog<bool>(/* real "Delete post?" dialog */);
      if (confirmed == true) onDeleteConfirm?.call();  // null-safe → silent no-op
    },
    ...
  ),
],
```

**Effect:** a post author viewing their own post on the feed sees a greyed-out, untappable edit icon
(no way to discover why), and a fully-tappable delete icon that shows a real confirmation dialog —
tapping "Delete" closes the dialog and does **nothing**, silently. This is a materially worse trap
than a disabled button: the user gets a genuine confirmation UI that implies the action succeeded.
`postActionsProvider.update()`/`.delete()` both work correctly and are called successfully elsewhere
in the app (e.g. reaction toggling on this very widget works, since `onToggleReaction` *is* wired) —
this is specifically a missing-prop wiring gap at the one call site, not a broken action method.
Reactions are unaffected: `onToggleReaction` **is** passed correctly, and
[ReactionButtons § Behavior notes](../../../../frontend/v1/feed/components/reaction-buttons.md)-equivalent
toggling works because `PostActions.toggleReaction()` itself invalidates the relevant providers
internally, independent of the null `onRefresh` callback.

Contrast with web's equivalent [PostHeader](../../../../frontend/v1/feed/components/post-header.md),
where `PostCard.tsx` wires `onEditStart`/`onDeleteConfirm`/`onRefresh` correctly — this is a
mobile-only regression, not a cross-platform parity gap present on both sides. See
[issues.md](../../../../issues.md) — filed as [MOB-011](../../../../issues.md#mob-011).

## Calls

Renders [ReactionInline](./reaction-buttons.md) with `postId`/`reactions` from `postData`; reaction
toggling routes through `onToggleReaction` → `postActionsProvider.toggleReaction()`
(`lib/api/client/posts/actions.dart`) → backend
[reactions/endpoints.md](../../../../backend/social-content/reactions/endpoints.md#create--toggle-a-reaction).
Edit/delete: see [Known issues](#known-issues) above — currently unreachable from this screen.
