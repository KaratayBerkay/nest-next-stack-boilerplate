# Sessions — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/sessions/`](../../../../../flutter-boilerplate/lib/api/client/sessions/) · Server:
[`lib/api/server/sessions/`](../../../../../flutter-boilerplate/lib/api/server/sessions/)

All calls use the shared `Dio` instance (`dioProvider`), base URL = `AppConfig.apiBaseUrl`. **Every
file in this vertical hits the NestJS backend directly over GraphQL** — confirmed by reading all 4
server files, not inferred from the vertical's REST/GraphQL split elsewhere in the app. See
[conventions.md § 9](../../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement).

## Shape per file

| File | Shape | Operation | Backend endpoint |
|---|---|---|---|
| [`list.dart`](../../../../../flutter-boilerplate/lib/api/server/sessions/list.dart) | Direct GraphQL (hand-rolled `_dio.post('/graphql', ...)`) | `query MySessions` | [List my sessions](../../../../backend/identity-access/sessions/endpoints.md#list-my-sessions) |
| [`revoke.dart`](../../../../../flutter-boilerplate/lib/api/server/sessions/revoke.dart) | Direct GraphQL | `mutation RevokeSession` | [Revoke a session](../../../../backend/identity-access/sessions/endpoints.md#revoke-a-session) |
| [`revoke_others.dart`](../../../../../flutter-boilerplate/lib/api/server/sessions/revoke_others.dart) | Direct GraphQL | `mutation RevokeAllOtherSessions` | [Revoke all other sessions](../../../../backend/identity-access/sessions/endpoints.md#revoke-all-other-sessions) |
| [`trust_device.dart`](../../../../../flutter-boilerplate/lib/api/server/sessions/trust_device.dart) | Direct GraphQL | `mutation TrustCurrentDevice` | [Trust the current device](../../../../backend/identity-access/sessions/endpoints.md#trust-the-current-device) — **not called by this screen**, see below |

`list.dart`'s `MySessions` query requests only `sessionId deviceId ip userAgent issuedAt` — narrower
than web's equivalent, which also requests `deviceType`/`trusted`. This is a query-shape choice, not a
backend limitation (the `mySessions` field supports both) — it's why this screen can't render a
"Trusted" badge (see [screen.md § Behavior notes](./screen.md#behavior-notes-vs-web)).

## Client layer (`lib/api/client/sessions/`)

| File | Purpose |
|---|---|
| [`actions.dart`](../../../../../flutter-boilerplate/lib/api/client/sessions/actions.dart) | `sessionActionsProvider` → `SessionActions` (`revoke`, `revokeOthers`) — thin pass-through, no `trustCurrentDevice` method (not this vertical's concern, see below) |
| [`query.dart`](../../../../../flutter-boilerplate/lib/api/client/sessions/query.dart) — not read in full, exposes `sessionsProvider` (`FutureProvider`) consumed by `screen.md`'s `sessionsAsync.when(...)` | list query |

## `trust_device.dart` — filed here, used elsewhere

Same cross-module situation as web: `trust_device.dart` lives in this `api/server/sessions/` folder
(it's the sessions module's own mutation) but its only real caller is
[`views/auth/login/page_content.dart`](../../../../../flutter-boilerplate/lib/views/auth/login/page_content.dart)'s
MFA-challenge "remember this device" flow, confirmed by grep
(`trustDeviceServer`/`TrustDeviceServer` referenced there, not in this screen or its providers). See
[sessions/README.md § `trustCurrentDevice`](../../../../backend/identity-access/sessions/README.md#trustcurrentdevice--a-sessions-module-mutation-with-an-auth-flow-only-caller).
`sessionActionsProvider`'s `SessionActions` class itself doesn't even expose a `trustDevice` method —
the login flow reads `trustDeviceServerProvider` directly instead, one layer lower.
