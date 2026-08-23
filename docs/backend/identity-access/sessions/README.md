# Sessions (backend)

**Source:** [`nest-js-boilerplate/src/sessions/`](../../../../nest-js-boilerplate/src/sessions/) ·
**Category:** [Identity & Access](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

The active-sessions-list surface: enumerate a user's own live Redis sessions across devices, revoke
one or all-but-current, and mark the current device as trusted. One resolver
(`SessionsResolver`), no service of its own — it reads/writes directly through
[`TokenStoreService`](../../../../nest-js-boilerplate/src/auth/token-store.service.ts) (from `auth/`)
and enriches with `Device` rows from Postgres. Wired into `app.module.ts`'s `CORE_MODULES` directly.
See [`sessions.module.ts`](../../../../nest-js-boilerplate/src/sessions/sessions.module.ts).

Confirms the earlier research this task was scoped from: `mySessions`/`revokeSession`/
`revokeAllOtherSessions` are real and exactly as described. It also owns a fourth mutation,
`trustCurrentDevice`, not previously called out — see below.

## `sessionId` is hashed, not encrypted

`mySessions`' `SessionInfo.sessionId` field is **not** the raw session identifier and not run through
the general [`id-codec`](../../platform-core/common/id-codec/README.md) transport-encryption
either — it's a one-way
`sha256(session.sessionId)` fingerprint (`hashSessionId`, in
[`crypto.service.ts`](../../../../nest-js-boilerplate/src/common/crypto/crypto.service.ts)). The
client only ever needs to reference a session to revoke it, never to reconstruct or replay the
underlying bearer credential — `revokeSession`'s `sessionId` argument is matched against this same
hash server-side (`TokenStoreService.revokeSessionBySessionId`), so a leaked list response can't be
used to hijack a session, only to identify one for revocation.

## `trustCurrentDevice` — a sessions-module mutation with an auth-flow-only caller

`trustCurrentDevice()` ([`sessions.resolver.ts#L140-152`](../../../../nest-js-boilerplate/src/sessions/sessions.resolver.ts))
flips `Device.trusted = true` for whichever device backs the caller's *current* session. Reading its
real frontend/mobile callers (not the file's own name) shows it is **only ever invoked from the login
MFA-challenge flow** — the "remember this device" checkbox in
[`MfaChallengeForm.tsx`](../../../../next-js-boilerplate/src/features/auth/ui/MfaChallengeForm.tsx)
(web) and the equivalent login screen (mobile) — **not** from the sessions settings page itself.
`views/settings/sessions/FreePageView.tsx` never imports `trust-device` in any form. This is the same
kind of cross-module placement as
[messaging's friend-request routes living in `MessagingController`](../../messaging-realtime/messaging/README.md#what-this-module-owns):
the mutation is implemented here (it needs `TokenStoreService`/session lookup, which this module
already has), but its only real trigger belongs to the login flow's
[`MfaChallengeForm`](../../../frontend/auth/login/components/mfa-challenge-form.md) (web) and
[login screen](../../../mobile/auth/login/screen.md) (mobile) — documented there, not duplicated
here beyond this note. This also explains an otherwise-odd
frontend/mobile detail: the BFF route and Dart provider names both say "sessions"
(`api/server/sessions/trust-device.ts`, `api/server/sessions/trust_device.dart`) but the **route
path** on web is `/api/auth/trust-device`, filed under the `auth` BFF namespace, not `/api/sessions/*`
alongside the other three — the URL grouping follows the real caller, the file/provider naming follows
the backend module. Both are correct; neither alone tells the whole story.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| GraphQL resolver | [`sessions.resolver.ts`](../../../../nest-js-boilerplate/src/sessions/sessions.resolver.ts) | [endpoints.md](./endpoints.md) |

`SessionAuthGuard` on the whole resolver — see [identity-access/auth](../auth/README.md).

## Depends on

`AuthModule` (`TokenStoreService`, `SessionAuthGuard`), `RealtimeModule` (`closeSocketsForSession` —
revoking a session force-closes any live WebSocket tied to it, not just the HTTP session).

## Used by

| App | Page / Screen | Calls |
|---|---|---|
| Frontend | [settings/sessions](../../../frontend/v1/settings/sessions/page.md) | `mySessions`, `revokeSession`, `revokeAllOtherSessions` |
| Frontend | [login page](../../../frontend/auth/login/page.md)'s [`MfaChallengeForm`](../../../frontend/auth/login/components/mfa-challenge-form.md) | `trustCurrentDevice` |
| Mobile | [settings/sessions](../../../mobile/v1/settings/sessions/screen.md) | `mySessions`, `revokeSession`, `revokeAllOtherSessions` |
| Mobile | [login screen](../../../mobile/auth/login/screen.md) | `trustCurrentDevice` |

## Known issues

None specific to this module — the `trustCurrentDevice` placement above is a documentation-clarity
note, not a bug (the mutation works correctly from its actual caller).
