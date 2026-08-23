# FeedListEmptyState (widget)

**Source:** [`feed_list_empty_state.dart`](../../../../../flutter-boilerplate/lib/components/feed/feed_list_empty_state.dart)
**Used in:** [feed screen](../screen.md), when the feed (or a search) returns zero posts, or on a
load error with no cached posts
**Web equivalent:** [FeedListEmptyState component](../../../../frontend/v1/feed/components/feed-list-empty-state.md)

## Purpose

Centered empty-state message with a "be the first to share" button. Purely presentational.

## Constructor

```dart
class FeedListEmptyState extends StatelessWidget {
  final String? lang;
  final VoidCallback? onShare;
}
```

Unlike web's version (a self-contained `<Link>`), this widget takes `onShare` as a callback — every
real call site in [`feed_base_view.dart`](../screen.md) wires it to
`context.push('/v1/{lang}/share')`, so behavior matches web exactly; the indirection is just this
widget not importing `go_router` directly.

## Calls

None directly — `onShare` is the caller's navigation callback to [share](../../share/screen.md).
