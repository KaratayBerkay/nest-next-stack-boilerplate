# API Keys — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/api_keys/`](../../../../../flutter-boilerplate/lib/api/client/api_keys/) · Server:
[`lib/api/server/api_keys/`](../../../../../flutter-boilerplate/lib/api/server/api_keys/)

All calls use the shared `Dio` instance, direct to the NestJS backend over GraphQL — confirmed by
reading all 3 server files. See
[conventions.md § 9](../../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement).

## Shape per file

| File | Shape | Operation | Backend endpoint |
|---|---|---|---|
| [`list.dart`](../../../../../flutter-boilerplate/lib/api/server/api_keys/list.dart) | Direct GraphQL | `query MyApiKeys` | [List my API keys](../../../../backend/identity-access/api-keys/endpoints.md#list-my-api-keys) |
| [`create.dart`](../../../../../flutter-boilerplate/lib/api/server/api_keys/create.dart) | Direct GraphQL | `mutation CreateApiKey` | [Create an API key](../../../../backend/identity-access/api-keys/endpoints.md#create-an-api-key) |
| [`revoke.dart`](../../../../../flutter-boilerplate/lib/api/server/api_keys/revoke.dart) | Direct GraphQL | `mutation RevokeApiKey` | [Revoke an API key](../../../../backend/identity-access/api-keys/endpoints.md#revoke-an-api-key) |

No file here calls `updateApiKey` — matches the confirmed absence of any rename/enable-disable UI on
this screen (`CROSS-012` (resolved)); `grep -rn "updateApiKey"
flutter-boilerplate/lib` returns nothing at all, not even a stub.

## Client layer (`lib/api/client/api_keys/`)

| File | Purpose |
|---|---|
| [`actions.dart`](../../../../../flutter-boilerplate/lib/api/client/api_keys/actions.dart) | `apiKeyActionsProvider` → `ApiKeyActions` (`create`, `revoke`) — thin pass-through |
| [`query.dart`](../../../../../flutter-boilerplate/lib/api/client/api_keys/query.dart) | `apiKeysProvider` (`FutureProvider`) — the list query `screen.md`'s `keysAsync.when(...)` consumes |

## Not called from here

The **dead** `api_key_handlers.dart` (`ApiKeyHandlers`, a `Provider`-wrapped class with its own
`create`/`revoke` methods duplicating what `page_content.dart` does inline through
`apiKeyActionsProvider` directly) is not part of this call chain at all — see
[screen.md § Known issues](./screen.md#known-issues) (`CROSS-013` (resolved)). Don't
mistake it for a second, alternate API layer; it's unreachable code sharing this folder's naming
convention.
