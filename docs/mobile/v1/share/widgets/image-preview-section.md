# ImagePreviewSection (widget)

**Source:** [`image_preview_section.dart`](../../../../../flutter-boilerplate/lib/views/share/image_preview_section.dart)
**Used in:** [share screen](../screen.md)
**Web equivalent:** [ImagePreviewSection component](../../../../frontend/v1/share/components/image-preview-section.md)

## Purpose

Same three-state UI as web: idle preview (`Image.file`, local picked file — not yet a network image,
since this widget renders before/during upload) with a remove button, an uploading spinner overlay,
and a failed-upload error banner with Remove/Retry actions.

## Constructor

```dart
class ImagePreviewSection extends StatelessWidget {
  final String? filePath;
  final UploadStatus uploadStatus;   // enum { idle, uploading, failed }
  final String? imageUrl;
  final VoidCallback? onRemove;
  final VoidCallback? onRetry;
}
```

Unlike web's version (which only ever has a `preview` data-URL string), this widget can be driven by
either a local `filePath` (pre-upload) or a remote `imageUrl` (unused in practice — `screen.md`'s
`_submit()` never sets `_uploadedImageUrl` before this widget would need it, since the screen
navigates away immediately after a successful create; the `imageUrl`-driven render path is
reachable in principle but not exercised by the real submit flow).

## Calls

None — purely presentational, same as web's equivalent. `onRemove`/`onRetry` are callbacks into
[`SharePageContent`](../screen.md)'s `_clearImage`/`_retryUpload`.
