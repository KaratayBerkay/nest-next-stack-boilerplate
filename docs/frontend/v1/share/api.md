# Share — API

Page: [page.md](./page.md)

This page makes exactly two network calls, both from
[`share-actions.ts`](../../../../next-js-boilerplate/src/views/share/share-actions.ts)'s
`handleShareSubmit`, and both are owned and fully documented by [posts/api.md](../posts/api.md) —
this page has no `api/client/share/` or `api/server/share/` folder of its own.

| Call | Client hook | BFF route | Backend endpoint |
|---|---|---|---|
| Upload the picked image | `uploadImageServer(file)` — [`api/server/posts/upload.ts`](../../../../next-js-boilerplate/src/api/server/posts/upload.ts), lazy-`import()`ed inline in `handleShareSubmit`, called **before** `usePostActions` | `POST /api/upload` | [Upload a single image](../../../backend/messaging-realtime/upload/endpoints.md#upload-a-single-image) |
| Create the post | [`usePostActions().createPost(title, content, imageUrl?)`](../posts/api.md#create-a-post-client) | `POST /api/posts` | [Create a post](../../../backend/social-content/post/endpoints.md#create-a-post) |

## Call order matters

`uploadImageServer` is awaited to completion (or failure) **before** `createPost` is ever called —
see [page.md § Submit flow](./page.md#submit-flow). There is no parallel upload+create, and no
"create the post, attach the image later" fallback: if the upload fails, the post is never created at
all, even though title/content are already valid and ready to submit. The user has to fix or remove
the image and resubmit from scratch (`handleRetry`/`handleRemove`, see
[ImagePreviewSection](./components/image-preview-section.md)).
