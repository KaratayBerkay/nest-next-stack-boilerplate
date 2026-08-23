# Share — API

Screen: [screen.md](./screen.md)

Two calls, both direct-to-backend GraphQL/REST (no BFF — see
[conventions.md § 9](../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)),
both owned and documented in [feed/api.md](../feed/api.md):

| Call | Provider method | Shape | Backend endpoint |
|---|---|---|---|
| Upload the picked image | `postActionsProvider.uploadImage(filePath)` → `PostUploadServer.call()` | Direct REST, `POST /upload/single` (matches the backend's own native route — see [feed/api.md § Shape per file](../feed/api.md#shape-per-file)) | [Upload a single image](../../../backend/messaging-realtime/upload/endpoints.md#upload-a-single-image) |
| Create the post | `postActionsProvider.create(title:, content:, imageUrl:)` → `PostCreateServer.call()` | Direct GraphQL, `mutation CreatePost` | [Create a post](../../../backend/social-content/post/endpoints.md#create-a-post) |

Same call-order dependency as web's [share/api.md](../../../frontend/v1/share/api.md#call-order-matters):
the upload is awaited to completion before `create` is ever called; a failed upload means no post is
created at all.
