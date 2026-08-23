# ImagePreviewSection

**Source:** [`ImagePreviewSection.tsx`](../../../../../next-js-boilerplate/src/views/share/ImagePreviewSection.tsx)
**Types:** [`ImagePreviewSection-types.ts`](../../../../../next-js-boilerplate/src/types/share/ImagePreviewSection-types.ts)
**Used in:** [share page](../page.md)
**Mobile equivalent:** [ImagePreviewSection widget](../../../../mobile/v1/share/widgets/image-preview-section.md)

## Purpose

Shows a client-side data-URL preview of the picked image (`FileReader.readAsDataURL`, resolved in
[`share-actions.ts`'s `handleFileChange`](../hooks.md)) with three states: idle preview (remove
button), uploading (spinner overlay), and failed (error banner with Remove/Retry actions). Renders
`null` if no preview exists yet.

## Props (`ImagePreviewSectionProps`)

| Prop | Purpose |
|---|---|
| `preview` | the data-URL string to render, or `null` |
| `uploading`, `uploadError` | which of the three visual states to show |
| `coverImageRef` | a ref the parent clears (`undefined`) on retry, so a stale uploaded-URL doesn't get reused |
| `fileRef` | the parent's `<input type=file>` ref, cleared on remove |
| `setFile`, `setPreview`, `setUploadError` | state setters, called directly by this component's own `handleRemove`/`handleRetry` |
| `t` | translation strings |

## Behavior notes

- `handleRemove` and `handleRetry` are defined **inside** this component (not passed in as props) —
  the only two pieces of logic this otherwise-presentational component owns itself. `handleRemove`
  clears `file`/`preview`/`uploadError` and the file input's DOM value directly; `handleRetry` only
  clears `uploadError` and `coverImageRef` — it does **not** re-trigger the upload itself, it just
  clears the failed state so the next form submit (`handleShareSubmit`, see [api.md](../api.md))
  re-attempts the upload for the already-picked file.

## Calls

None — no network calls of its own; the actual upload happens in
[`share-actions.ts`'s `handleShareSubmit`](../api.md), not here.
