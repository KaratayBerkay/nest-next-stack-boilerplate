# Share (page)

**Route:** `/v1/[lang]/share` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/share/page.tsx)
**Mobile equivalent:** [share screen](../../../mobile/v1/share/screen.md)

## What renders here

A single, un-tiered page — no `getTierView()` branch here (confirmed: `page.tsx` just renders
`<PageContent />` directly). This is a real post-composer page, not a demo: it composes a new
[`post`](../../../backend/social-content/post/README.md) via the same `createPost` GraphQL mutation
[feed](../feed/page.md)'s "Share" button links to.

`PageContent` (client component,
[`views/share/PageContent.tsx`](../../../../next-js-boilerplate/src/views/share/PageContent.tsx))
owns all form state directly (`title`, `content`, `file`, `preview`, `submitting`, `uploading`,
`error`, `uploadError`) — no custom hook, unlike most other pages in this effort's docs. Renders:

```
PageContent
├─ title <Input>            (3-200 chars, required)
├─ content <Textarea>       (required, no client-side max)
├─ image <input type=file>  (optional, accept="image/*")
└─ ImagePreviewSection      (shown once a file is picked)
```

## Submit flow

`handleShareSubmit` ([`share-actions.ts`](../../../../next-js-boilerplate/src/views/share/share-actions.ts)):

1. If a file was picked and hasn't already failed upload, calls `uploadImageServer(file)` first —
   **synchronously blocks the post creation** until the upload resolves (or fails, in which case the
   whole submit aborts with `uploadError: true` and the post is never created).
2. Calls `createPost(title, content, coverImageRef.current)` — note the local variable is named
   `coverImageRef` but is passed as the mutation's **`imageUrl`** argument
   (`usePostActions().createPost(title, content, imageUrl?)`) — this page never sets the backend's
   separate `coverImage` field, see
   [post/README.md](../../../backend/social-content/post/README.md#what-this-module-owns).
3. On success, `router.push('/v1/{lang}/feed')` — no confirmation screen, straight back to the feed
   where the new post now appears (via the realtime `Feed` renew frame, see
   [feed/hooks.md](../feed/hooks.md#realtime-refresh-not-a-hook--a-query-cache-flag)).

There is no draft-save, no cancel-confirmation, and no client-side content-length cap — only the
title has a browser-native `minLength`/`maxLength`.

## Components

1 significant component:

[image-preview-section.md](./components/image-preview-section.md)

## Hooks & API

- [hooks.md](./hooks.md) — this page has no page-specific hooks; `share-actions.ts`'s plain
  functions are described above and in [api.md](./api.md)
- [api.md](./api.md) — the two calls this page makes (`uploadImageServer`, `createPost`), both
  documented in full in [posts/api.md](../posts/api.md)

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Create a post | [post/endpoints.md#create-a-post](../../../backend/social-content/post/endpoints.md#create-a-post) |
| Upload the cover image | [upload module § Upload a single image](../../../backend/messaging-realtime/upload/endpoints.md#upload-a-single-image), see [posts/api.md](../posts/api.md#server--bff-routes-srcapiserverposts) for the BFF hop |

## Known issues affecting this page

None specific to this page's own code. See [post/README.md § Known issues](../../../backend/social-content/post/README.md#known-issues)
for the `coverImage`/`imageUrl` field-duality note this page is the source of (only this page and
mobile's [share](../../../mobile/v1/share/screen.md)/[posts create](../../../mobile/v1/posts/create/screen.md)
screens create posts at all, and none of the three ever sets `coverImage`).
