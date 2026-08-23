# Usage — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/usage/`](../../../../nest-js-boilerplate/src/usage/)

No GraphQL surface — `usage.controller.ts` is a plain REST controller, two `GET`s, both under
`@Controller('api')` + class-level `@UseGuards(SessionAuthGuard)`.

## REST

### Get message-storage usage

**Kind:** REST · **`GET /api/usage/messages`** · query `from?`, `to?` (ISO date strings)
**Source:** [`usage.controller.ts#L13-L30`](../../../../nest-js-boilerplate/src/usage/usage.controller.ts),
logic in [`usage.service.ts#L126-L159`](../../../../nest-js-boilerplate/src/usage/usage.service.ts) (`UsageService.getMessageUsage`)
**Auth:** `SessionAuthGuard` (full session required).
**Behavior:** defaults `to` to now and `from` to the start of the current UTC month when either is
omitted. Sums `letterCount` across every `Message` (DM) and `RoomMessage` (chat room) row this user
sent in `[from, to]`, converts the letter count to an estimated byte figure
(`BYTES_PER_LETTER = 1.35`), and returns the tier's monthly limit alongside it. Reads
`user.tier` from the request (attached by `SessionAuthGuard` from the Redis session snapshot — see
[auth/README.md § Session model](../../identity-access/auth/README.md#session-model--four-token-compound-key-in-redis)),
defaulting to `FREE` if absent.
**Response:** [`MessageUsageResult`](../../../../nest-js-boilerplate/src/usage/usage.service.ts) —
`{ letters, bytes, limitBytes, tier, multiplier, from, to }` (`from`/`to` echoed back as ISO strings).
**Used by:** Frontend
[`MessageStorageCard.tsx`](../../../../next-js-boilerplate/src/views/settings/usage/MessageStorageCard.tsx)
(on [settings/usage/page.md](../../../frontend/v1/settings/usage/page.md)) and
[`StorageLimitNotice`](../../../frontend/v1/messages/components/storage-limit-notice.md) (via
[messages/page.md](../../../frontend/v1/messages/page.md), which uses this same query to decide
whether to block the chat composer). Mobile:
[`message_storage_card.dart`](../../../../flutter-boilerplate/lib/views/settings/usage/message_storage_card.dart)
(on [settings/usage/screen.md](../../../mobile/v1/settings/usage/screen.md)) only — no mobile
chat-composer equivalent of `StorageLimitNotice` exists, see ⚠
[CROSS-033](../../../issues.md#cross-033).

### Get upload-storage usage

**Kind:** REST · **`GET /api/usage/storage`**
**Source:** [`usage.controller.ts#L32-L38`](../../../../nest-js-boilerplate/src/usage/usage.controller.ts),
logic in [`usage.service.ts#L106-L124`](../../../../nest-js-boilerplate/src/usage/usage.service.ts) (`UsageService.getUploadStorageUsage`)
**Auth:** `SessionAuthGuard`.
**Behavior:** sums `size` and counts rows across **every** `PendingUpload` this user has ever
uploaded (`uploadedBy = userId`, no date filter — cumulative, unlike the message limit above).
**Response:** [`UploadStorageUsageResult`](../../../../nest-js-boilerplate/src/usage/usage.service.ts) —
`{ bytes, fileCount, limitBytes, tier, multiplier }`.
**Used by:** Frontend
[`UploadStorageCard.tsx`](../../../../next-js-boilerplate/src/views/settings/usage/UploadStorageCard.tsx)
(on [settings/usage/page.md](../../../frontend/v1/settings/usage/page.md)); Mobile
[`upload_storage_card.dart`](../../../../flutter-boilerplate/lib/views/settings/usage/upload_storage_card.dart)
(on [settings/usage/screen.md](../../../mobile/v1/settings/usage/screen.md)).
⚠ Both cards render a hard "limit reached, upgrade" warning once `bytes >= limitBytes` — see
[BE-022](../../../issues.md#be-022): nothing server-side actually stops the upload once
that point is reached, on either platform.

## Internal guards (not HTTP endpoints)

Exposed by `UsageService` for other modules to call directly — not reachable via any route of their
own, listed here because they're this module's actual enforcement surface (see
[README.md § Enforcement](./README.md#enforcement-one-real-guard-one-dead-one)).

### `assertCanSendMessage(userId, additionalLetters)`

**Source:** [`usage.service.ts#L43-L74`](../../../../nest-js-boilerplate/src/usage/usage.service.ts)
**Behavior:** re-derives the current month's usage via the same logic as
[Get message-storage usage](#get-message-storage-usage) above, adds `additionalLetters`, and throws if
the projected byte total exceeds the tier's limit.
**Errors:** `403 EX_USAGE_LIMIT_REACHED`.
**Called by:** [`MessagingDmService.sendAndDeliverMessage`](../../messaging-realtime/messaging/README.md)
(`messaging-dm.service.ts#L424`) and
[`MessagingRoomService.saveRoomMessage`](../../messaging-realtime/messaging/README.md)
(`messaging-room.service.ts#L269`) — both call it with `countLetters(text)` **before** persisting,
so a message send can genuinely fail once the sender's monthly budget is spent, on every conversation
surface (DM and room) and on every client that sends a message (web WS/REST fallback, mobile GraphQL —
see the [messaging endpoints doc](../../messaging-realtime/messaging/endpoints.md) for those call
shapes).

### `assertCanUploadBytes(userId, additionalBytes, tier)`

**Source:** [`usage.service.ts#L76-L98`](../../../../nest-js-boilerplate/src/usage/usage.service.ts)
**Behavior:** same shape as `assertCanSendMessage` above, computed against
[Get upload-storage usage](#get-upload-storage-usage)'s cumulative total instead of a monthly one.
**Errors:** `403 EX_UPLOAD_STORAGE_LIMIT_REACHED` — in principle; never actually thrown in practice.
**Called by:** nobody. ⚠ [BE-022](../../../issues.md#be-022) — confirmed via a full-repo
grep for `assertCanUploadBytes`, the only match is this method's own definition. The
[upload module](../../messaging-realtime/upload/README.md)'s controller/services never import
`UsageService`. Every attachment upload on both platforms (chat and room) succeeds regardless of how
much a user has already uploaded, on every tier.

## Known issues

- ⚠ [BE-022](../../../issues.md#be-022) — `assertCanUploadBytes` is dead code; the
  upload-storage limit is displayed on both platforms but never enforced.
- ⚠ [CROSS-033](../../../issues.md#cross-033) — no mobile equivalent of web's
  `StorageLimitNotice`; the real message-storage cap is only discoverable on mobile via a raw failed
  send.
- Full findings with severity are filed in [`issues.md`](../../../issues.md).
