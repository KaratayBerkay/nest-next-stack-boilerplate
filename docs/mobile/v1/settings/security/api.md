# Security — API

Screen: [screen.md](./screen.md) · Server:
[`lib/api/server/auth/mfa.dart`](../../../../../flutter-boilerplate/lib/api/server/auth/mfa.dart)

**Same folder-naming note as web**: this screen's entire MFA API surface lives under
`lib/api/server/auth/`, not `lib/api/server/security/` or `lib/api/server/mfa/` — mirrors
[frontend api.md](../../../../frontend/v1/settings/security/api.md)'s identical observation almost
exactly, confirming it's a deliberate app-wide convention (organize by backend module reached, not by
screen), not a one-off naming accident on either platform.

## Shape

**Direct GraphQL** — `mfa.dart` hand-rolls every call as `_dio.post('/graphql', {'query': ..., ...})`,
no `gql_helper.dart`. Confirmed by reading the file in full: all 5 exported methods use this same
shape. See
[conventions.md § 9](../../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement) —
mobile has no BFF at all here, unlike web's necessarily-BFF'd equivalent.

## One file, two owners

| Method | Operation | Backend endpoint | Owner |
|---|---|---|---|
| `enrollMfa()` | `mutation EnrollMfa` | [Enroll in MFA](../../../../backend/identity-access/mfa/endpoints.md#enroll-in-mfa) | **this screen** (`mfa_enroll` sub-screen) |
| `verifyMfa(code)` | `mutation VerifyMfa` | [Verify MFA enrollment](../../../../backend/identity-access/mfa/endpoints.md#verify-mfa-enrollment) | **this screen** (`mfa_enroll` sub-screen) |
| `disableMfa(code)` | `mutation DisableMfa` | [Disable MFA](../../../../backend/identity-access/mfa/endpoints.md#disable-mfa) | **this screen** (`_MfaTile`'s disable dialog) |
| `verifyLoginMfa(mfaToken, code)` | `mutation VerifyLoginMfa` | `auth.resolver.ts`'s `verifyLoginMfa` — a different mutation | login MFA challenge, not this screen |
| `resendLoginCode(mfaToken)` | `mutation ResendLoginCode` | `auth.resolver.ts`'s `resendLoginCode` | login MFA challenge, not this screen |

All 5 are called via `ref.read(loginActionsProvider)` — a single `LoginActions` class in
[`api/client/auth/actions.dart`](../../../../../flutter-boilerplate/lib/api/client/auth/actions.dart)
that also owns login/register/password-reset/change-password, i.e. the client-layer naming ("login
actions") is even more auth-flow-centric than the server-layer folder name. `_MfaTile`/
`MfaEnrollPageContent` call `enrollMfa()`/`verifyMfa()`/`disableMfa()` on it; the login screen calls
`verifyLoginMfa()`/`resendLoginCode()` on the same provider instance.

## Change password — out of scope, linked only

`ChangePasswordPageContent`'s submit calls `loginActionsProvider.changePassword(current, new)`, which
resolves through `changePasswordServerProvider` →
[`api/server/auth/change_password.dart`](../../../../../flutter-boilerplate/lib/api/server/auth/change_password.dart)
(direct GraphQL) → backend
[`changePassword`](../../../../backend/identity-access/auth/endpoints.md#change-password).
[identity-access/auth](../../../../backend/identity-access/auth/README.md)'s territory — linked here
as the exact call site, not independently detailed. This screen
(`change_password/page_content.dart`, documented in full at
[widgets/change-password.md](./widgets/change-password.md)) is the caller `auth/endpoints.md`'s own
`changePassword` entry links to — a coordination gap between the two concurrent passes that wrote
these docs, resolved; see [CROSS-015](../../../../issues.md#cross-015).

## Not called from here

`resetMfa` ([authorization/endpoints.md#reset-a-users-mfa](../../../../backend/identity-access/authorization/endpoints.md#reset-a-users-mfa))
is a different, admin-only mutation with no relationship to this file — don't confuse it with
`disableMfa` above despite the similar purpose. `_resetMfa()` in
[`views/auth/login/page_content.dart`](../../../../../flutter-boilerplate/lib/views/auth/login/page_content.dart)
is also unrelated: a local UI-state-reset function (clears the login screen's own MFA-challenge form
fields), not a caller of any MFA mutation. See
[authorization/README.md § Known issues](../../../../backend/identity-access/authorization/README.md#known-issues).
