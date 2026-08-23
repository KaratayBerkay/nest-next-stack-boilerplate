# ApiKeyList

**Source:** [`ApiKeyList.tsx`](../../../../../../next-js-boilerplate/src/views/settings/api-keys/ApiKeyList.tsx)
**Types:** [`ApiKeyList-types.ts`](../../../../../../next-js-boilerplate/src/types/views/settings/ApiKeyList-types.ts)
**Used in:** [api-keys page](../page.md)
**Mobile equivalent:** the api-keys screen's own inline `Card` list (mobile's *separate*
`ApiKeyList`/`ApiKeyItem` widget file is dead code, not the real thing — see
[mobile api-keys/screen.md](../../../../../mobile/v1/settings/api-keys/screen.md#known-issues), do not
confuse the two)

## Purpose

Renders the list of keys: name, active/disabled badge, masked prefix, created/last-used/expiry dates,
and a Revoke button per row. Loading and empty states included in the same component (not split out).

## Props (`ApiKeyListProps`)

| Prop | Purpose |
|---|---|
| `keys` | `ApiKeyInfo[]` — see [api-keys/endpoints.md#list-my-api-keys](../../../../../backend/identity-access/api-keys/endpoints.md#list-my-api-keys) for the shape |
| `loadingKeys` | shows a plain `t.loading` text row — no skeleton component, unlike [sessions](../../sessions/components/session-card.md)'s `SessionSkeleton` |
| `toast` | passed down rather than called via `useToast()` internally, so the revoke-confirmation toast text is fully controlled by the parent |
| `loadKeys` | re-fetch callback, called after a successful revoke |
| `revokeApiKey` | the mutation function itself — see **Calls** below |

## Behavior notes

- **The `enabled`/`disabled` badge is read-only** — there is no click target on it, no toggle. Given
  the backend's `updateApiKey` mutation exists specifically to flip `enabled`, this is the visible
  symptom of [CROSS-012](../../../../../issues.md#cross-012): the UI can *display* a key's enabled
  state but has no way to *change* it short of full revocation.
- Revoke is gated behind a native `confirm()` dialog (`handleRevokeApiKey` in `api-key-handlers.ts`),
  not a styled `ConfirmDialog` component the way
  [ChatMessageBubble](../../../messages/components/chat-message-bubble.md)'s delete actions are on the
  messages page — a UI-polish inconsistency, not a functional bug.

## Calls (indirect — this component never calls `fetch`/a hook's mutation directly)

```
ApiKeyList (revokeApiKey prop, via api-key-handlers.ts's handleRevokeApiKey)
  → useApiKeyActions().revokeApiKey()   — src/api/client/api-keys/actions.ts
    → revokeApiKeyServer()              — src/api/server/api-keys/revoke.ts
      → backend: DELETE-shaped BFF → GraphQL revokeApiKey(id)
```

- Frontend BFF route: [api.md § Revoke an API key](../api.md#revoke-an-api-key-bff-route)
- Backend endpoint: [api-keys/endpoints.md#revoke-an-api-key](../../../../../backend/identity-access/api-keys/endpoints.md#revoke-an-api-key)
