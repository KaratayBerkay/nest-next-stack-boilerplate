# Usage (page)

**Route:** `/v1/[lang]/settings/usage` · **Source:** [`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/settings/usage/page.tsx)
→ [`PageContent.tsx`](../../../../../next-js-boilerplate/src/views/settings/usage/PageContent.tsx)
**Mobile equivalent:** [settings/usage screen](../../../../mobile/v1/settings/usage/screen.md)
**Settings index:** [../README.md](../README.md) (row updated by this doc)

> This vertical existed in source since before Phase 4 but fell through the gap between Phase 4's two
> sub-efforts (both explicitly scoped it out) and Phase 5 (different assigned scope) — see
> [usage backend README § Used by](../../../../backend/billing-usage/usage/README.md#used-by), which
> already documented these two components as forward-referenced consumers. Written now to close that
> gap rather than leaving it permanently undocumented.

No tier gating and no `getTierView()` split — unlike every other settings subpage, there are no
`Free/Basic/Medium/PremiumPageView.tsx` files here at all. `PageContent.tsx` renders a single flat
layout for every tier.

## What renders here

```
UsagePageContent
├─ UploadStorageCard   (GET /api/usage/storage)
└─ MessageStorageCard  (GET /api/usage/messages)
```

Both cards are independent `useQuery` consumers (`staleTime: 60_000`, no shared provider/context) and
follow the identical shape: a loading skeleton, then a stored-amount readout, a progress bar, and —
only once `bytes >= limitBytes` — an inline "limit reached" warning. Both always render a static
"upgrade" hint line regardless of current usage.

| Card | Query | Reads | Shown |
|---|---|---|---|
| [`UploadStorageCard`](../../../../../next-js-boilerplate/src/views/settings/usage/UploadStorageCard.tsx) | `storageUsageQueryOptions()` | `bytes`, `fileCount`, `limitBytes`, `multiplier` | cumulative, all-time upload total |
| [`MessageStorageCard`](../../../../../next-js-boilerplate/src/views/settings/usage/MessageStorageCard.tsx) | `messageUsageQueryOptions()` | `bytes`, `letters`, `limitBytes` | current calendar-month message total |

`messageUsageQueryOptions(from?, to?)` accepts an optional date range, but this page never passes one
— it always renders the current-month figure the backend defaults to. See
[usage backend README](../../../../backend/billing-usage/usage/README.md) for the byte-conversion
heuristic (`BYTES_PER_LETTER = 1.35`) and per-tier multiplier table behind both numbers.

## Data flow (BFF-proxied, confirmed)

Both queries dynamic-`import()` a `src/api/server/usage/{messages,storage}.ts` function
(`fetchMessageUsageServer`/`fetchStorageUsageServer`), which calls `apiFetch()` against this app's own
relative `USAGE_MESSAGES_URL`/`USAGE_STORAGE_URL` (`/api/usage/{messages,storage}`) — real Next.js
Route Handlers at
[`app/api/usage/messages/route.ts`](../../../../../next-js-boilerplate/src/app/api/usage/messages/route.ts)
/ [`.../storage/route.ts`](../../../../../next-js-boilerplate/src/app/api/usage/storage/route.ts),
which forward to the backend's `GET /api/usage/{messages,storage}` with the session's bearer token +
device/session headers attached server-side. Standard BFF pattern, no surprises — see
[architecture.md § BFF proxy pattern](../../../../architecture.md#bff-proxy-pattern--nextjs-sits-between-the-browser-and-the-backend).
**Calls:** [usage/endpoints.md § Get message-storage usage](../../../../backend/billing-usage/usage/endpoints.md#get-message-storage-usage),
[§ Get upload-storage usage](../../../../backend/billing-usage/usage/endpoints.md#get-upload-storage-usage).

## Known issues affecting this page

- ⚠ [BE-022](../../../../issues.md#be-022) — the upload card's "limit reached" warning has **no real
  enforcement standing behind it**: unlike the message-storage limit (`assertCanSendMessage`, checked
  server-side before every send), nothing on the backend actually blocks an upload once
  `bytes >= limitBytes` — this page can show the warning while uploads keep succeeding regardless. See
  [usage backend README § Enforcement](../../../../backend/billing-usage/usage/README.md#enforcement-one-real-guard-one-dead-one).
- Not a bug on this page specifically, but relevant context: the
  [messages page](../../messages/page.md)'s
  [`StorageLimitNotice`](../../messages/components/storage-limit-notice.md) reads the same
  message-usage query this page's `MessageStorageCard` does, to block the chat composer once the
  monthly letter budget is spent — mobile has no equivalent of that composer-blocking behavior, see
  ⚠ [CROSS-033](../../../../issues.md#cross-033). This page itself (the usage-summary display) is at
  parity on both platforms.
