# Share (screen)

**Route:** `/v1/:lang/share` (GoRouter name `v1Share`)
**Router registration:** [`router.dart#L342-L348`](../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => SharePageContent(lang: ...)`.
**Entry widget:** `SharePageContent` in
[`page_content.dart`](../../../../flutter-boilerplate/lib/views/share/page_content.dart)
**Web equivalent:** [share page](../../../frontend/v1/share/page.md)

## What renders here

No tier gate (matches web — un-tiered, un-gated page on both platforms). Title/content fields, an
image picker (`file_picker` package, `FileType.image`, client-side size/extension validation against
`UploadConstants.maxImageSize`/`allowedImageTypes` before the file is even staged — a check web's
equivalent doesn't do client-side, it only validates server-side), an
[ImagePreviewSection](./widgets/image-preview-section.md), and a submit button.

## Submit flow

Same two-step shape as web's [`handleShareSubmit`](../../../frontend/v1/share/page.md#submit-flow):
upload the image first (if one was picked), **await** it fully, then create the post with the
resulting URL. If upload fails, `_submit()` returns early (`UploadStatus.failed`) without ever
calling `postActionsProvider.create()` — same "no post without a successful image upload" behavior
as web, even though the title/content are already valid. On success, invalidates
`paginatedFeedProvider` directly (`ref.invalidate(...)`, not a provider-internal invalidation) and
navigates to `/v1/{lang}/feed` via `context.go()`.

**Client-side title-length validation exists here** (`title.length < 3 || title.length > 200`,
shown as an inline error) — unlike [posts/create](../posts/create/screen.md), which has none.

## Widgets

1 significant widget:

[image-preview-section.md](./widgets/image-preview-section.md)

## Hooks & API

- [hooks.md](./hooks.md) — no screen-specific hooks
- [api.md](./api.md) — the two calls this screen makes, both documented in
  [feed/api.md](../feed/api.md)/[posts/api.md](../posts/api.md)

## Backend endpoints this screen depends on

| Action | Backend doc |
|---|---|
| Create a post | [post/endpoints.md#create-a-post](../../../backend/social-content/post/endpoints.md#create-a-post) |
| Upload the cover image | [upload module § Upload a single image](../../../backend/messaging-realtime/upload/endpoints.md#upload-a-single-image) |

## Known issues affecting this screen

None specific to this screen's own code. See
[post/README.md § Known issues](../../../backend/social-content/post/README.md#known-issues) for the
`coverImage`/`imageUrl` note — this screen, like web's [share](../../../frontend/v1/share/page.md)
and [posts/create](../posts/create/screen.md), only ever sets `imageUrl`.
