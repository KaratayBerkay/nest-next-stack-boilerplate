# Usage (screen)

**Route:** `/v1/:lang/settings/usage` (GoRouter name `v1SettingsUsage`)
**Router registration:** [`router.dart#L412-417`](../../../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `SettingsUsagePageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/settings/usage/page_view.dart)
**Web equivalent:** [settings/usage page](../../../../frontend/v1/settings/usage/page.md)

> Same gap this screen's web counterpart notes: existed in source since before Phase 4, scoped out of
> both Phase 4 sub-efforts and out of Phase 5. Written now, alongside the web doc, to close it. See
> [usage backend README § Used by](../../../../backend/billing-usage/usage/README.md#used-by).

No `TierGate`/tier split — `page_view.dart`'s own doc comment states it directly: *"Mirrors
next-js-boilerplate's `PageContent.tsx` — no tier gating on web..., so this is a single flat page."*
Confirmed accurate; matches web exactly.

## What renders here

```
SettingsUsagePageContent
├─ UploadStorageCard   (storageUsageProvider)
└─ MessageStorageCard  (messageUsageProvider)
```

Both are `ConsumerWidget`s watching a `FutureProvider` ([`api/client/usage/query.dart`](../../../../../flutter-boilerplate/lib/api/client/usage/query.dart)),
same loading/error/data three-state shape as every other Riverpod-backed screen in this app. Same
content shape as web: stored amount, progress bar, a "limit reached" message once `bytes >=
limitBytes`, and a static upgrade hint always shown.

| Card | Provider | Reads |
|---|---|---|
| [`UploadStorageCard`](../../../../../flutter-boilerplate/lib/views/settings/usage/upload_storage_card.dart) | `storageUsageProvider` → `StorageUsageServer` | `bytes`, `fileCount`, `limitBytes`, `multiplier` |
| [`MessageStorageCard`](../../../../../flutter-boilerplate/lib/views/settings/usage/message_storage_card.dart) | `messageUsageProvider` → `MessageUsageServer` | `bytes`, `letters`, `limitBytes` |

`MessageUsageServer.call()` accepts optional `from`/`to`, but `messageUsageProvider` never passes
them — same "always current month, no date picker on this screen" behavior as web.

## Data flow — direct to backend, no BFF hop (verified per [conventions.md § 9](../../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement))

Both servers (`api/server/usage/{messages,storage}.dart`) call `_dio.get('/api/usage/{messages,storage}',
...)` on the shared `dioProvider` Dio instance, whose base URL is the NestJS backend directly — the
literal path matches the backend's own native route exactly, not a Next.js-namespaced one, same
REST-direct shape already established for this app's other non-GraphQL verticals. No Next.js
involvement for this screen at all.
**Calls:** [usage/endpoints.md § Get message-storage usage](../../../../backend/billing-usage/usage/endpoints.md#get-message-storage-usage),
[§ Get upload-storage usage](../../../../backend/billing-usage/usage/endpoints.md#get-upload-storage-usage).

## Known issues

- ⚠ `BE-022` (resolved) — same as web: the upload card's "limit reached" warning has
  no real backend enforcement behind it. Not a mobile-specific gap.
- Not a bug on this screen, but related: mobile has no equivalent of web's composer-blocking
  [`StorageLimitNotice`](../../../../frontend/v1/messages/components/storage-limit-notice.md) — see
  ⚠ `CROSS-033` (resolved). This screen (the usage-summary display) is itself at
  parity with web.
