# Upload — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/upload/`](../../../../nest-js-boilerplate/src/upload/)

## REST

Base path: `/upload` (see `@Controller('upload')` in
[`upload.controller.ts`](../../../../nest-js-boilerplate/src/upload/upload.controller.ts)).
**Auth:** `SessionAuthGuard` on the whole controller — see
[identity-access/auth](../../identity-access/auth/README.md). A 401 (guard rejection) applies to
every handler below and isn't repeated per entry.

### Upload a single image

**Kind:** REST · **`POST /upload/single`** · multipart, field name `file`
**Source:** [`upload.controller.ts#L221-L249`](../../../../nest-js-boilerplate/src/upload/upload.controller.ts)
**Request:** one image (`image/{jpeg,png,webp,gif,avif}`, magic-byte validated, ≤10 MB).
**Response:** `{ urls: { badge, medium, full }, originalname, mimetype, size }` — three resized webp
variants (64×64 / 400×400 / 1920×1080), each its own public R2 object (see
[README.md § Storage & access model](./README.md#storage--access-model) — these are **not** encrypted
or access-gated like chat attachments).
**Errors:** `400` (wrong MIME/failed magic-byte check) · `413` (over 10 MB).
**Used by:** avatar upload ([profile](../../../frontend/v1/settings/account/page.md) /
[settings/account (mobile)](../../../mobile/v1/settings/account/screen.md)), post/share cover images
— out of this vertical's scope, documented in their own pages.

### Upload multiple images

**Kind:** REST · **`POST /upload/multiple`** · multipart, field name `files`, max 10
**Source:** [`upload.controller.ts#L251-L272`](../../../../nest-js-boilerplate/src/upload/upload.controller.ts)
**Response:** `{ count, images: { badge, medium, full }[] }` — same per-file processing as
[Upload a single image](#upload-a-single-image), run in parallel.
**Errors:** same as above, per file.

### Upload a chat attachment

**Kind:** REST · **`POST /upload/attachment`** · multipart, field name `file`
**Source:** [`upload.controller.ts#L274-L357`](../../../../nest-js-boilerplate/src/upload/upload.controller.ts)
**Request headers (optional):** `x-scope-kind: chat-room` + `x-scope-id: <room-slug>` — see
[README.md § Upload scoping](./README.md#upload-scoping--one-endpoint-two-composers). Omitted or any
other `x-scope-kind` value scopes the upload to the uploader's own DM folder.
**Request body:** one file — images/PDF magic-byte validated, `.doc`/`.docx`/`.txt` declared-type-only
(`ChatAttachmentTypeValidator`) — ≤10 MB, and must not push the uploader over their tier's storage
quota (see [README.md § Size, type, and quota limits](./README.md#size-type-and-quota-limits)).
**Behavior:** encrypts the buffer (`StorageCryptoService.encryptBytes`), uploads the ciphertext to R2,
best-effort-generates and separately uploads a thumbnail (see
[README.md § Thumbnail generation](./README.md#thumbnail-generation)), and writes a `PendingUpload`
row keyed by the generated `objectName` — the row exists **before** any message references it.
**Response:** `{ url, originalname, mimetype, size, envelope?: {v, nonce, ct} }` — `envelope` is
returned to the client mainly for backward compatibility; the authoritative copy is the
server-side `PendingUpload` row (see
[`attachment-envelopes.util.ts`](../../../../nest-js-boilerplate/src/messaging/attachment-envelopes.util.ts)).
**Errors:** `400` (wrong MIME/failed validation) · `413` (over 10 MB, or over the uploader's storage
quota).
**Used by:** Mobile [messages](../../../mobile/v1/messages/screen.md) and
[chat-room](../../../mobile/v1/chat-room/screen.md) (`upload_attachment.dart`, the only attachment
upload path Flutter uses — see [chat-room api.md](../../../mobile/v1/chat-room/api.md)). Web has a
matching BFF route (`POST /api/upload/attachment`) but nothing currently calls it — ⚠ see
[FE-012](../../../issues.md#fe-012).

### Stream a chat attachment upload

**Kind:** REST · **`POST /upload/attachment-stream`** · raw `application/octet-stream` body, no
multipart
**Source:** [`upload.controller.ts#L368-L473`](../../../../nest-js-boilerplate/src/upload/upload.controller.ts)
**Request headers:** `x-filename` (percent-encoded), `x-content-type`; same optional
`x-scope-kind`/`x-scope-id` pair as [Upload a chat attachment](#upload-a-chat-attachment).
**Behavior:** identical validation/encryption/thumbnail/`PendingUpload` pipeline as the buffered
route above, except the request body is read directly off the in-flight stream in chunks (no multer
buffering) — this is what lets the client report real byte-level upload progress via
`XMLHttpRequest.upload.onprogress` (`fetch` has no such hook). An early `Content-Length` check plus a
running byte-count during the read loop both guard the 10 MB cap, so an unannounced or misreported
size still gets cut off.
**Response:** `{ url, originalname, mimetype, size }` (no `envelope` field — the streamed route never
returns one; contrast the buffered route above).
**Errors:** `400` (wrong MIME) · `413` (over 10 MB or storage quota) · `400` (empty request body).
**Used by:** Frontend [messages](../../../frontend/v1/messages/page.md) and
[chat-room](../../../frontend/v1/chat-room/page.md) — both via the shared
[`useAttachmentUploads`](../../../frontend/v1/messages/hooks.md#useattachmentuploads) hook →
[`uploadAttachmentStreamServer`](../../../frontend/v1/messages/api.md#everything-else), which is the
**only** upload path either web vertical actually calls (the buffered route above and its BFF proxy
exist but are unused — see [FE-012](../../../issues.md#fe-012)).

### Serve a decrypted attachment

**Kind:** REST · **`GET /upload/serve`** · query `objectName` (percent-encoded, required)
**Source:** [`upload.controller.ts#L484-L528`](../../../../nest-js-boilerplate/src/upload/upload.controller.ts)
**Behavior:** looks up the `PendingUpload` row, runs `assertCanAccessUpload` (uploader, or the DM's
sender/recipient once linked, or a sufficiently-tiered room member once linked — see
[README.md § Storage & access model](./README.md#storage--access-model)), fetches the ciphertext from
R2, decrypts with the uploader's derived key, and streams plaintext back with a `Content-Type`
resolved from the object's file extension and a 1-year immutable `Cache-Control`.
**Errors:** `400` (missing `objectName`) · `404` (row doesn't exist, access denied, or decrypt
failed — all three collapse to the same 404 so the endpoint can't be used to enumerate real
`objectName`s).
**Used by:** every attachment preview/download on both platforms — Frontend
[`AttachmentPreview`](../../../frontend/v1/messages/page.md) (shared component, not messages-specific)
via `serveUrl()`; Mobile the equivalent shared
[`AttachmentPreview`](../../../mobile/v1/chat-room/widgets/chat-room-message-list.md) widget via
`_serveUrl()`. Also the target of avatar/cover-image URLs indirectly in the sense that they're on the
same R2 bucket, but those are fetched straight from `R2_PUBLIC_URL`, never through this endpoint (see
[README.md § Storage & access model](./README.md#storage--access-model)).
