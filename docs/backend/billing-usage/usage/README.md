# Usage (backend)

**Source:** [`nest-js-boilerplate/src/usage/`](../../../../nest-js-boilerplate/src/usage/) ·
**Category:** Billing & Usage · **Interface docs:** [endpoints.md](./endpoints.md)

> This category folder (`docs/backend/billing-usage/`) is created for the first time by this doc —
> the sibling `billing/` module is being documented concurrently by a parallel effort. The category
> index (`docs/backend/billing-usage/README.md`) is neither module's to write; it lands once both are
> done.

## What this module owns

Read-only quota accounting for two independent, per-user limits, both scaled by subscription tier:
how much message text a user has sent this month, and how many bytes of chat attachments they've ever
uploaded. Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly (not
demo-gated, line 170). Depends only on `AuthModule` (for `SessionAuthGuard`/`@CurrentUser()`) and
`PrismaService` — no Redis, no queues, no cross-module event consumption.

`UsageModule` exports `UsageService`, consumed directly (constructor-injected, not via an event) by the
[messaging module](../../messaging-realtime/messaging/README.md) — see
[Known issues](#known-issues) for the one place this pattern was expected but doesn't exist.

There is **no GraphQL surface at all** — `usage.controller.ts` is the module's only interface file, two
plain REST `GET`s. See [endpoints.md](./endpoints.md).

## The two limits, and why they behave differently

| | Message-storage limit | Upload-storage limit |
|---|---|---|
| Constant | `FREE_MONTHLY_STORAGE_BYTES` = 1 MiB | `FREE_UPLOAD_STORAGE_BYTES` = 250 MiB |
| Window | **Monthly** — default query range is `[start of current UTC month, now]`, and the caller can pass its own `from`/`to` | **Cumulative, all-time** — no date filter at all |
| Measured from | `SUM(letterCount)` across **both** `Message` (DMs) and `RoomMessage` (chat rooms), `WHERE senderId = userId AND createdAt BETWEEN from AND to` | `SUM(size)` + `COUNT(*)` over every `PendingUpload` row `WHERE uploadedBy = userId` — the upload module's own append-only ledger, so this is authoritative regardless of which messages/rooms ended up referencing a given upload |
| Unit stored | Letters (a count), converted to an estimated byte figure via `BYTES_PER_LETTER = 1.35` (a fixed UTF-8-plus-envelope-overhead heuristic — **not** a read of the real server-side-encrypted row size; `letterCount` itself is populated by the messaging module at write time, before [wire-crypto](../../messaging-realtime/wire-crypto/README.md)'s at-rest encryption, which is out of this module's scope) | Real bytes, read directly off the upload record |
| Server-side enforced? | **Yes** — `assertCanSendMessage()` | **No** — see below, ⚠ `BE-022` (resolved) |

Both limits scale by the same per-tier multiplier
(`TIER_STORAGE_MULTIPLIER` in
[`usage.constants.ts`](../../../../nest-js-boilerplate/src/usage/usage.constants.ts)):

| Tier | Multiplier | Effective message limit / month | Effective upload limit (cumulative) |
|---|---|---|---|
| FREE | 1x | 1 MiB | 250 MiB |
| BASIC | 2x | 2 MiB | 500 MiB |
| MEDIUM | 4x | 4 MiB | 1 GiB |
| PREMIUM | 8x | 8 MiB | 2 GiB |

## Enforcement: one real guard, one dead one

`UsageService` exposes two `assert*` methods meant to be called from wherever the corresponding action
is actually performed — neither is itself an HTTP endpoint:

- **`assertCanSendMessage(userId, additionalLetters)`** — real, and actually wired in. Both
  [`MessagingDmService.sendAndDeliverMessage`](../../messaging-realtime/messaging/README.md)
  (`messaging-dm.service.ts:424`) and
  [`MessagingRoomService.saveRoomMessage`](../../messaging-realtime/messaging/README.md)
  (`messaging-room.service.ts:269`) call it with `countLetters(text)` **before** persisting the
  message, throwing `403 EX_USAGE_LIMIT_REACHED` if the projected total would exceed the monthly cap.
  This is a real, load-bearing guard — sending a message really can fail once the tier's monthly
  letter budget is exhausted.
- **`assertCanUploadBytes(userId, additionalBytes, tier)`** — fully implemented (same shape: computes
  the projected total, throws `403 EX_UPLOAD_STORAGE_LIMIT_REACHED` if it would exceed
  `limitBytes`) but has **zero callers anywhere in the codebase**. The
  [upload module](../../messaging-realtime/upload/README.md)
  (`upload.controller.ts`, `s3-bucket.service.ts`, `image.service.ts`,
  `attachment-thumbnail.service.ts`) never imports `UsageService` at all — confirmed via a full-repo
  grep for both the class name and the method name inside `nest-js-boilerplate/src/upload`, zero
  matches beyond the method's own definition. **A user can upload unlimited attachment bytes
  regardless of tier** — the 250 MiB×multiplier cap this module computes and both frontend and mobile
  display (see [Used by](#used-by)) is cosmetic only. See ⚠ `BE-022` (resolved).

## Used by

Both REST endpoints are called identically by two "usage card" components per platform, all living
under the `settings/usage` vertical — now documented at
[frontend/v1/settings/usage/page.md](../../../frontend/v1/settings/usage/page.md) and
[mobile/v1/settings/usage/screen.md](../../../mobile/v1/settings/usage/screen.md) (a gap between
Phase 4's two sub-efforts and Phase 5's own different scope, closed directly once found):

| App | Component | Reads |
|---|---|---|
| Frontend | [`MessageStorageCard.tsx`](../../../../next-js-boilerplate/src/views/settings/usage/MessageStorageCard.tsx) | `GET /api/usage/messages` |
| Frontend | [`UploadStorageCard.tsx`](../../../../next-js-boilerplate/src/views/settings/usage/UploadStorageCard.tsx) | `GET /api/usage/storage` |
| Mobile | [`message_storage_card.dart`](../../../../flutter-boilerplate/lib/views/settings/usage/message_storage_card.dart) | `GET /api/usage/messages` |
| Mobile | [`upload_storage_card.dart`](../../../../flutter-boilerplate/lib/views/settings/usage/upload_storage_card.dart) | `GET /api/usage/storage` |

Both platforms' cards render an "upgrade" hint and a hard "limit reached" warning once `bytes >=
limitBytes` — for the upload card, this warning is shown with **no real enforcement standing behind
it** (see above).

A third, already-documented consumer exists **only on web**: the
[messages page](../../../frontend/v1/messages/page.md)'s
[`StorageLimitNotice`](../../../frontend/v1/messages/components/storage-limit-notice.md) reads
`messageUsageQueryOptions()` to replace the chat composer entirely with a blocking "upgrade to send
more" notice once the monthly letter budget is spent. **Mobile has no equivalent** — see ⚠
`CROSS-033` (resolved), which closes the question Phase 0 left open in that
same component doc.

## Relationship to `billing`

Every limit here is keyed by `subscriptionTier` (via `TIER_STORAGE_MULTIPLIER`), the same field the
sibling [`billing`](../billing/README.md) module (documented separately, this phase's parallel effort)
mutates through `subscribeToPlan`/`cancelSubscription`. This module never calls into `billing` or vice
versa — the coupling is entirely through the `User.subscriptionTier` column and the session snapshot's
`tier` field (`req.user.tier`, attached by `SessionAuthGuard` — see
[auth/README.md § Session model](../../identity-access/auth/README.md#session-model--four-token-compound-key-in-redis)),
not a direct dependency either direction.

## Known issues

- ⚠ `BE-022` (resolved) — upload-storage limit is fully computed and
  displayed on both platforms but never actually enforced (`assertCanUploadBytes` has no caller).
- ⚠ `CROSS-033` (resolved) — mobile has no client-side equivalent of web's
  `StorageLimitNotice`; the real, server-enforced message-storage cap is only discoverable on mobile
  as a raw failed-send error.
- Full findings with severity and evidence are filed in [`issues.md`](../../../issues.md).
