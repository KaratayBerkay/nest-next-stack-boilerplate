# PostContent (widget)

**Source:** [`post_content.dart`](../../../../../flutter-boilerplate/lib/components/feed/post_content.dart)
**Used in:** [PostCard](./post-card.md)
**Web equivalent:** [PostContent component](../../../../frontend/v1/feed/components/post-content.md)

## Purpose

64×64 cached-network-image thumbnail (`CachedNetworkImage`, when `imageUrl` is set), title
(2-line-clamped), and a 200-char-truncated body — or, in edit mode, two plain `TextField`s. Same
shape as web's equivalent, one difference: this widget re-creates a fresh `TextEditingController`
inline on every rebuild while editing (`TextEditingController(text: editTitle ?? postData.title)`,
not a `late final` held in `State`) rather than a persistent controller — functionally works because
`onChanged` still fires and the parent owns the actual text value, but loses cursor
position/selection on any rebuild that isn't caused by the field's own `onChanged` (e.g. a sibling
widget rebuilding). Minor, not filed as its own issue.

## Constructor

```dart
class PostContent extends StatelessWidget {
  final Post postData;
  final bool editing;
  final String? editTitle;
  final String? editContent;
  final ValueChanged<String>? onTitleChange;
  final ValueChanged<String>? onContentChange;
}
```

## Calls

None — pure presentational widget, same as its web counterpart.
