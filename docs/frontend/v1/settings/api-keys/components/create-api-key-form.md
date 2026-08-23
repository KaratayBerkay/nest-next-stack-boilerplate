# CreateApiKeyForm

**Source:** [`CreateApiKeyForm.tsx`](../../../../../../next-js-boilerplate/src/views/settings/api-keys/CreateApiKeyForm.tsx)
**Types:** [`CreateApiKeyForm-types.ts`](../../../../../../next-js-boilerplate/src/types/views/settings/CreateApiKeyForm-types.ts)
**Used in:** [api-keys page](../page.md) — shown in place of the "+ Create" button when `showCreate` is
true
**Mobile equivalent:** the api-keys screen's inline create `AlertDialog` (mobile's *separate*
`CreateApiKeyForm` widget file is dead code — see
[mobile api-keys/screen.md](../../../../../mobile/v1/settings/api-keys/screen.md#known-issues))

## Purpose

Name input + a fixed set of expiry presets (no expiry / 7 / 30 / 90 / 365 days, as selectable
`Button`s rather than a `<select>`) + submit/cancel. Inline form, not a modal — replaces the "+
Create" button in place within the page's own flex column.

## Props (`CreateApiKeyFormProps`)

| Prop | Purpose |
|---|---|
| `newName` / `setNewName` | controlled name input, owned by the parent `PageContent` |
| `newExpiry` / `setNewExpiry` | controlled expiry preset, stored as a **string** (`""` for no expiry, else `"7"`/`"30"`/`"90"`/`"365"`) — converted to `number \| null` only at submit time |
| `creating` / `setCreating` | submit-in-flight flag |
| `setNewKeyResult` | where the freshly-created full key gets surfaced, back up in `PageContent` |
| `toast`, `loadKeys`, `createApiKey`, `onCancel` | passed straight through to the handler function below |

## Behavior notes

- All five expiry options are rendered as a `Wrap` of toggle-style buttons rather than a native
  `<select>` — makes the "no expiry" default state visually explicit (a highlighted button) rather
  than an easy-to-miss blank dropdown.
- Submit is disabled while `creating` or when the trimmed name is empty — client-side only; the
  backend independently enforces per-user name uniqueness (see
  [api-keys/endpoints.md#create-an-api-key](../../../../../backend/identity-access/api-keys/endpoints.md#create-an-api-key)'s
  `409 EX_API_KEY_NAME_EXISTS`).

## Calls (indirect — this component never calls `fetch`/a hook's mutation directly)

```
CreateApiKeyForm (createApiKey prop, via api-key-handlers.ts's handleCreateApiKey)
  → useApiKeyActions().createApiKey()   — src/api/client/api-keys/actions.ts
    → createApiKeyServer()              — src/api/server/api-keys/create.ts
      → backend: POST-shaped BFF → GraphQL createApiKey(name, expiresInDays)
```

- Frontend BFF route: [api.md § Create an API key](../api.md#create-an-api-key-bff-route)
- Backend endpoint: [api-keys/endpoints.md#create-an-api-key](../../../../../backend/identity-access/api-keys/endpoints.md#create-an-api-key)
