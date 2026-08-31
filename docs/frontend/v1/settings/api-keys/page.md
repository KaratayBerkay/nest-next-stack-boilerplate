# API Keys (page)

**Route:** `/v1/[lang]/settings/api-keys` · **Source:**
[`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/settings/api-keys/page.tsx)
**Mobile equivalent:** [api-keys screen](../../../../mobile/v1/settings/api-keys/screen.md)

## What renders here

Server component, **no tier-branch split at all** — `page.tsx` renders
`<PageContent />` directly, no `getTierView()`, no `FreePageView`/etc. files. Simpler wiring than
either [security](../security/page.md) (also no tier split, but does an SSR data pre-fetch) or
[sessions](../sessions/page.md) (has the tier-branch scaffolding even though unused) — this page does
neither: all data loading happens client-side, after mount.

## Client component tree

```
PageContent                            (keys, loadingKeys, showCreate, newKeyResult state)
├─ (newKeyResult)   inline "created" banner with copy/dismiss
├─ showCreate ? CreateApiKeyForm : "+ Create" button
└─ ApiKeyList
```

`PageContent` loads keys itself in a `useEffect` gated on `user` from `useAuth()` (skips the fetch
entirely, `setLoadingKeys(false)`, if there's no session) — the same "own all state directly, no
page-level hook" pattern as [security](../security/page.md) and
[sessions](../sessions/page.md)'s `FreePageView`. None of this vertical's 3 pages uses a dedicated
`hooks/settings/` file.

## Components

2 significant components in
[`src/views/settings/api-keys/`](../../../../../next-js-boilerplate/src/views/settings/api-keys/),
plus a non-component handler file:

[api-key-list.md](./components/api-key-list.md) · [create-api-key-form.md](./components/create-api-key-form.md)

`api-key-handlers.ts` (`handleCreateApiKey`/`loadApiKeys`/`handleRevokeApiKey`) is the real handler
layer both components' callbacks resolve through — documented inline in [api.md](./api.md) and the two
component docs rather than given its own page, since it's pure orchestration with no UI of its own
(same treatment `mfa-handlers.ts`'s *live* counterpart would get, if security's inline handlers were
factored out the same way).

## Hooks & API

- [api.md](./api.md) — `useApiKeyActions()` (create, revoke), `listApiKeysServer()`, and the
  `updateApiKey` gap.

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| List my API keys | [api-keys/endpoints.md#list-my-api-keys](../../../../backend/identity-access/api-keys/endpoints.md#list-my-api-keys) |
| Create an API key | [api-keys/endpoints.md#create-an-api-key](../../../../backend/identity-access/api-keys/endpoints.md#create-an-api-key) |
| Revoke an API key | [api-keys/endpoints.md#revoke-an-api-key](../../../../backend/identity-access/api-keys/endpoints.md#revoke-an-api-key) |

`updateApiKey` ([api-keys/endpoints.md#update-an-api-key](../../../../backend/identity-access/api-keys/endpoints.md#update-an-api-key))
has a complete BFF proxy (`PATCH /api/api-keys/[id]`) but is never called from this page — see Known
issues.

## Known issues

- `CROSS-012` (resolved) — no rename/enable-disable UI exists anywhere on this
  page (or its mobile equivalent) despite the backend + BFF being fully built. `ApiKeyList` only
  renders a static enabled/disabled `Badge`, never an editable one.
