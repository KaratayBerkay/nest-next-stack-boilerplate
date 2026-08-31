# Upload (backend)

**Source:** [`nest-js-boilerplate/src/upload/`](../../../../nest-js-boilerplate/src/upload/) ·
**Category:** [Messaging & Realtime](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

One controller, `UploadController` (`@Controller('upload')`, `SessionAuthGuard` on the whole class),
backed by three focused services. It covers two genuinely different jobs that happen to share an
object-storage backend:

- **Chat attachments** — the file-attach flow for both [messages](../messaging/README.md) (1:1 DMs)
  and [chat-room](../messaging/README.md) (group rooms): `POST /upload/attachment` (buffered) /
  `POST /upload/attachment-stream` (streamed, byte-level progress) to upload, `GET /upload/serve` to
  fetch a file back out. This is this module's primary relevance to Phase 3b — documented in full in
  [endpoints.md](./endpoints.md).
- **Generic image upload** — `POST /upload/single` / `POST /upload/multiple`, three fixed resized
  webp variants (badge/medium/full) per image, no scoping/thumbnailing/encryption-at-rest concerns at
  all. Used by avatar upload
  ([profile](../../social-content/profile/README.md)) and post/share cover images
  ([posts](../../../frontend/v1/posts/api.md), [share](../../../frontend/v1/share/api.md)) — those
  verticals own their own docs; noted here only because the same controller/service trio serves them.
  A `views/forms/uploads` demo page also exercises this path directly.

| Service | Owns |
|---|---|
| [`S3BucketService`](../../../../nest-js-boilerplate/src/upload/s3-bucket.service.ts) | Cloudflare R2 (S3-compatible, via the `minio` client) object read/write/delete. Objects are private; nothing here is a CDN-facing public URL for chat attachments — see **Storage & access model** below. |
| [`ImageService`](../../../../nest-js-boilerplate/src/upload/image.service.ts) | `sharp`-based resize to 3 fixed sizes (`badge` 64×64, `medium` 400×400, `full` 1920×1080), always re-encoded to webp q80. Used only by `/upload/single`/`/upload/multiple`. |
| [`AttachmentThumbnailService`](../../../../nest-js-boilerplate/src/upload/attachment-thumbnail.service.ts) | Best-effort 320×320 webp thumbnail generation for chat attachments — see **Thumbnail generation** below. |

Wired into [`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES`
directly (not demo-gated) — see [`upload.module.ts`](../../../../nest-js-boilerplate/src/upload/upload.module.ts).

## Storage & access model

R2 objects are **always private** — there is no public bucket URL for anything this module writes for
chat, regardless of what `S3BucketService.upload()`'s return value (`${R2_PUBLIC_URL}/${objectName}`)
looks like. Two different consumption paths exist for the two jobs above:

- **Chat attachments are encrypted at rest** (`StorageCryptoService.encryptBytes`, keyed per-uploader —
  see [wire-crypto](../wire-crypto/README.md)) and can only be read back through
  `GET /upload/serve`, which decrypts server-side and re-streams plaintext with the right
  `Content-Type`. The raw R2 object is ciphertext; fetching it directly (even if the bucket domain
  were reachable) would yield nothing usable without the server's key.
- **Generic images** (`/upload/single`/`/upload/multiple` — avatars, post covers) are stored
  **unencrypted** and are meant to be fetched directly from `R2_PUBLIC_URL` (a public bucket domain,
  e.g. `assets.eys.gen.tr`) — no `/upload/serve` round-trip, no session check on read.

`GET /upload/serve` itself is guarded by `assertCanAccessUpload` — not everyone who knows an
`objectName` can decrypt it. Allowed callers: the uploader themselves (covers a file uploaded but not
yet attached to any sent message), or — once a `PendingUpload` row has been linked to a real message —
that DM's sender/recipient, or a member of the room with sufficient tier. Same `404` for "doesn't
exist" and "not yours," so the endpoint doesn't leak which `objectName`s are real. See
[`upload.controller.ts#L541-L574`](../../../../nest-js-boilerplate/src/upload/upload.controller.ts).

### `PendingUpload` — the upload-time record

Every chat-attachment upload (single or streamed) writes one `PendingUpload` row **before** the
message that will reference it is ever sent — `kind` (`MESSAGES` | `CHAT_ROOM`), `scopeId`,
`filename`, `mimetype`, `size`, the storage envelope (`v`/`nonce`; `ct` is legacy-only, R2 is the sole
ciphertext copy now), and `thumbnailUrl` (if a thumbnail was generated) are all written at upload
time. `messageId`/`roomMessageId` start `null` and are backfilled by
[`MessagingDmService`](../../../../nest-js-boilerplate/src/messaging/messaging-dm.service.ts)/[`MessagingRoomService`](../../../../nest-js-boilerplate/src/messaging/messaging-room.service.ts)
once the message actually gets saved — see
[`attachment-envelopes.util.ts`](../../../../nest-js-boilerplate/src/messaging/attachment-envelopes.util.ts)'s
`resolveAttachmentEnvelopes()`, which resolves each attachment's storage envelope purely by matching
`url`. ⚠ See [BE-017](#known-issues) — this lookup (and the backfill `updateMany` that follows
it) never checks that the `PendingUpload` was actually uploaded by the sender, or scoped to the
conversation/room the message is landing in.

### Upload scoping — one endpoint, two composers

Chat attachments from both DM and room composers hit the same `/upload/attachment*` routes; the
client announces which one via two request headers, read by `resolveUploadScope()`
([`upload.controller.ts#L71-L97`](../../../../nest-js-boilerplate/src/upload/upload.controller.ts)):

| Header | Values | Effect |
|---|---|---|
| `x-scope-kind` | `chat-room` (anything else, including absent, defaults to DM) | Selects `UploadKind.CHAT_ROOM` vs `UploadKind.MESSAGES` |
| `x-scope-id` | a room slug (`^[a-z0-9-]{1,64}$`) when `x-scope-kind: chat-room`; otherwise ignored (the uploader's own id is used) | Object-storage foldering: `uploads/chat-room/<roomId>/…` vs `uploads/messages/<userId>/…`; thumbnails live in a sibling `thumbnails/` folder under the same scope |

This is purely a storage/bookkeeping distinction at upload time — it does **not** gate who can later
attach the resulting `url` to a message (see [BE-017](#known-issues) again).

## Thumbnail generation

Triggered **synchronously at upload time**, inline in both `POST /upload/attachment` and
`POST /upload/attachment-stream` (`generateAndStoreThumbnail`,
[`upload.controller.ts#L177-L219`](../../../../nest-js-boilerplate/src/upload/upload.controller.ts)) —
not a background job, not generated on first read. The original upload and its thumbnail (if any) are
written to R2 in parallel (`Promise.all`). `AttachmentThumbnailService.generate()`:

| Source type | Method |
|---|---|
| `image/{jpeg,png,webp,gif,avif}` | Direct resize to 320×320 webp |
| `application/pdf` | Shell out to poppler's `pdftoppm` (page 1 only, 5s timeout, temp-dir based), then resize the rendered PNG to webp |
| `text/plain` | Render the first 10 lines (44 chars/line) as a small SVG "text card," then rasterize to webp |
| `.doc`/`.docx` | Skipped — "no safe cheap rasterizer" (source comment) |

Never throws — any failure (corrupt file, missing `pdftoppm` binary, timeout) is caught and logged,
`generate()` returns `null`, and the upload proceeds without a thumbnail (`thumbnailUrl` omitted). The
thumbnail, when produced, is encrypted and uploaded as **its own separate R2 object with its own
`PendingUpload` row** — this is why both `messaging-dm.service.ts` and `messaging-room.service.ts`
explicitly link *two* URLs (the original and, if present, the thumbnail) to the saved message, not
just one: a thumbnail whose `PendingUpload` row never gets a `messageId`/`roomMessageId` would 404 via
`assertCanAccessUpload` for every recipient except the uploader.

**Web surfaces the generated thumbnail; mobile currently does not** — see
[CROSS-027](#known-issues). The data is generated, stored, served in the JSON response, and even
parsed into the Dart model end-to-end; only the final widget layer drops it.

## Size, type, and quota limits

- **10 MB** per file (`MAX_FILE_SIZE_BYTES`), enforced multiple ways depending on route: multer's
  `MaxFileSizeValidator` (buffered), an early `Content-Length` check plus a running byte-count during
  the read loop (streamed — so a client lying about `Content-Length` still gets cut off).
- **Allowed attachment types:** `image/{jpeg,png,webp,gif,avif}`, `application/pdf`,
  `application/msword`, the `.docx` MIME, `text/plain`. Images and PDFs are verified against magic
  bytes (`ChatAttachmentTypeValidator`, strict); the legacy Office/text formats (no reliable magic
  number) fall back to declared-`Content-Type`-only validation.
- **Generic image upload** (`/upload/single`/`/upload/multiple`) only allows the 5 image MIME types
  above (no PDF/doc/txt) and caps `/upload/multiple` at **10 files** per request.
- **Per-user upload-storage quota**: `assertUploadStorageCapacity` sums every `PendingUpload.size` row
  for the user (append-only, so this is a true lifetime total, not a live "current usage" — deleting a
  message doesn't reclaim quota) and rejects (`413`) once
  `FREE_UPLOAD_STORAGE_BYTES` (250 MB) × `TIER_STORAGE_MULTIPLIER[tier]` (1/2/4/8 for FREE/BASIC/
  MEDIUM/PREMIUM) would be exceeded — see
  [`usage.constants.ts`](../../../../nest-js-boilerplate/src/usage/usage.constants.ts), documented
  fully in Phase 4's `billing-usage/usage/` (not written yet — `docs/backend/billing-usage/` doesn't
  exist as of this phase).

## Depends on

`AuthModule` (`SessionAuthGuard`), `WireCryptoModule` (`StorageCryptoService` — see
[wire-crypto](../wire-crypto/README.md)). `messaging-dm.service.ts`/`messaging-room.service.ts` depend
*on this module's data* (`PendingUpload`) without a NestJS module import — there's no `UploadModule`
import in `messaging.module.ts`; the coupling is entirely through the shared Prisma table.

## Used by

| App | Page / Screen |
|---|---|
| Frontend | [messages](../../../frontend/v1/messages/page.md) (DM attachments + [AttachmentGallerySheet](../../../frontend/v1/messages/components/attachment-gallery-sheet.md)) · [chat-room](../../../frontend/v1/chat-room/page.md) (room attachments + [RoomAttachmentGallerySheet](../../../frontend/v1/chat-room/components/room-attachment-gallery-sheet.md)) — both via [api.md § Send a message (client)](../../../frontend/v1/messages/api.md#send-a-message-client)'s upload flow. Generic image upload: [profile](../../../frontend/v1/settings/account/page.md) (avatar), [share](../../../frontend/v1/share/page.md) / [posts](../../../frontend/v1/posts/api.md) (cover image), plus an unrelated `views/forms/uploads` demo. |
| Mobile | [messages](../../../mobile/v1/messages/screen.md) (`upload_attachment.dart`, buffered path only) · [chat-room](../../../mobile/v1/chat-room/screen.md) (same file, reused — see [chat-room api.md](../../../mobile/v1/chat-room/api.md)). Generic image upload: [settings/account](../../../mobile/v1/settings/account/screen.md) (avatar), share/posts (cover image). |

## Known issues

- `BE-016` (resolved) — the VIP chat room (`vip-lounge`) both frontend and mobile
  expose to Medium/Premium tiers has no corresponding `Room` database row created by any seed or
  startup path — sending the first message in it fails. Not this module's bug (the fix is in
  `messaging`'s room seeding), but discovered while tracing this module's `assertCanAccessUpload`
  room-tier branch. See [chat-room page.md § Known issues](../../../frontend/v1/chat-room/page.md#known-issues-affecting-this-page).
- `BE-017` — attachment `url`s are resolved and re-linked (`messageId`/
  `roomMessageId` backfill) with no check that the `PendingUpload` was uploaded by the sender or
  scoped to the conversation/room the message lands in.
- [FE-012](../../../issues.md#fe-012) — the buffered BFF route `POST /api/upload/attachment` on web
  never forwards the `x-scope-kind`/`x-scope-id` headers to the backend (its streamed sibling route
  does). Currently dead code — nothing on web calls the buffered path.
- `CROSS-027` (resolved) — mobile's shared `AttachmentPreview` widget has no `thumbnailUrl`
  parameter at all, so neither [messages](../../../mobile/v1/messages/screen.md) nor
  [chat-room](../../../mobile/v1/chat-room/screen.md) ever render the thumbnails this module
  generates — every attachment preview fetches the full original file instead.
