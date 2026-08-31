# Auth — API

Vertical: [README.md](./README.md) · Client: [`lib/api/client/auth/`](../../../flutter-boilerplate/lib/api/client/auth/) ·
Server: [`lib/api/server/auth/`](../../../flutter-boilerplate/lib/api/server/auth/)

All calls use one shared `Dio` instance (`dioProvider`,
[`lib/lib/api_client.dart`](../../../flutter-boilerplate/lib/lib/api_client.dart) — the doubled
`lib/lib/` segment is real, confirmed elsewhere in this repo's mobile docs), base URL =
`AppConfig.apiBaseUrl` — the NestJS backend directly. **Every file in this vertical hits the backend
directly, confirmed by reading all 12 server files** — 11 of 12 are direct GraphQL (`POST /graphql`),
one (`device_handshake.dart`) is a direct REST call whose path matches the backend's own native
`devices/` controller route. **Zero Next.js involvement anywhere in this vertical** — same conclusion
as the `messages` vertical (see
[conventions.md § 9](../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)
and `CROSS-007` (resolved) for why this needs re-confirming per vertical
rather than assumed from precedent).

## Shape per file

| File | Shape | Operation | Backend endpoint |
|---|---|---|---|
| [`login.dart`](../../../flutter-boilerplate/lib/api/server/auth/login.dart) | Direct GraphQL | `mutation Login` | [Log in](../../backend/identity-access/auth/endpoints.md#log-in) |
| [`register.dart`](../../../flutter-boilerplate/lib/api/server/auth/register.dart) | Direct GraphQL | `mutation Register` | [Register](../../backend/identity-access/auth/endpoints.md#register) |
| [`logout.dart`](../../../flutter-boilerplate/lib/api/server/auth/logout.dart) | Direct GraphQL | `mutation Logout` | [Log out](../../backend/identity-access/auth/endpoints.md#log-out) |
| [`me.dart`](../../../flutter-boilerplate/lib/api/server/auth/me.dart) (`MeServer`) | Direct GraphQL | `query Me` | [Get the current session user](../../backend/identity-access/auth/endpoints.md#get-the-current-session-user) — **no caller among the 6 in-scope screens**, see [Known issues](#known-issues) |
| [`refresh_token.dart`](../../../flutter-boilerplate/lib/api/server/auth/refresh_token.dart) | Direct GraphQL (+ a direct REST `GET /csrf/token` first, for the double-submit CSRF header) | `mutation Refresh` | [Refresh the session](../../backend/identity-access/auth/endpoints.md#refresh-the-session) |
| [`request_password_reset.dart`](../../../flutter-boilerplate/lib/api/server/auth/request_password_reset.dart) | Direct GraphQL | `mutation RequestPasswordReset` | [Request a password reset](../../backend/identity-access/auth/endpoints.md#request-a-password-reset) |
| [`reset_password.dart`](../../../flutter-boilerplate/lib/api/server/auth/reset_password.dart) | Direct GraphQL | `mutation ResetPassword` | [Reset password](../../backend/identity-access/auth/endpoints.md#reset-password) |
| [`change_password.dart`](../../../flutter-boilerplate/lib/api/server/auth/change_password.dart) (`ChangePasswordServer`) | Direct GraphQL — **one file, two mutations** | `mutation ChangePassword`, `mutation UndoPasswordChange` | [Change password](../../backend/identity-access/auth/endpoints.md#change-password) (out of scope — no caller found in this pass), [Undo a password change](../../backend/identity-access/auth/endpoints.md#undo-a-password-change) (in scope) |
| [`verify_email.dart`](../../../flutter-boilerplate/lib/api/server/auth/verify_email.dart) | Direct GraphQL — one file, three mutations | `mutation VerifyEmail`, `mutation VerifyEmailCode`, `mutation ResendEmailCode` | [Verify email](../../backend/identity-access/auth/endpoints.md#verify-email), [with a code](../../backend/identity-access/auth/endpoints.md#verify-email-with-a-code), [resend](../../backend/identity-access/auth/endpoints.md#resend-the-email-verification-code) |
| [`device_handshake.dart`](../../../flutter-boilerplate/lib/api/server/auth/device_handshake.dart) | **Direct REST** — `POST /devices/handshake`, matches the backend's own native controller route exactly | — | [Device handshake](../../backend/identity-access/auth/endpoints.md#device-handshake) |
| [`mfa.dart`](../../../flutter-boilerplate/lib/api/server/auth/mfa.dart) | Direct GraphQL — one file, five mutations, split in/out of scope (same split as web's `mfa.ts`) | `verifyLoginMfa` (in scope), `enrollMfa`/`verifyMfa`/`disableMfa` (out of scope), `resendLoginCode` (in scope) | [Verify a login MFA code](../../backend/identity-access/auth/endpoints.md#verify-a-login-mfa-code), [Resend a login MFA code](../../backend/identity-access/auth/endpoints.md#resend-a-login-mfa-code) |
| [`oauth.dart`](../../../flutter-boilerplate/lib/api/server/auth/oauth.dart) (`OAuthLoginServer`) | Direct GraphQL | `mutation LoginWithOAuth` | [Log in with OAuth](../../backend/identity-access/auth/endpoints.md#log-in-with-oauth) |

## Client layer (`lib/api/client/auth/`)

| File | Purpose |
|---|---|
| [`actions.dart`](../../../flutter-boilerplate/lib/api/client/auth/actions.dart) | `loginActionsProvider` → `LoginActions` — thin pass-through wrapping every server file above (`login`, `register`, `logout`, `requestPasswordReset`, `resetPassword`, `changePassword`, `undoPasswordChange`, `verifyEmail`/`verifyEmailCode`/`resendEmailCode`, `verifyLoginMfa`/`resendLoginCode`, `enrollMfa`/`verifyMfa`/`disableMfa`). **This is the one provider all 6 in-scope screens actually call** — unlike web, where none of the 6 pages route through the equivalent `useAuthActions()`. |
| [`oauth.dart`](../../../flutter-boilerplate/lib/api/client/auth/oauth.dart) | `oauthActionsProvider` → `OAuthActions.loginWithOAuth(state)` — thin wrapper, called only after the OAuth deep-link round-trip resolves (see [login/widgets/social-login-buttons.md](./login/widgets/social-login-buttons.md)) |
| `queries.dart` | `currentUserProvider` — was a dead `FutureProvider` around `MeServer.call()` with a name collision; **deleted** in a later cleanup pass. See [Known issues](#known-issues) |

## Session state: `authProvider`

Not part of `api/`, but the provider every one of the 6 screens actually reads/writes around these
calls: [`hooks/use_auth.dart`](../../../flutter-boilerplate/lib/hooks/use_auth.dart)'s `authProvider`
(`StateNotifierProvider<AuthNotifier, AsyncValue<AuthenticatedUser?>>`). Persists the token quadruple
+ user snapshot to `flutter_secure_storage` (not just in-memory state, unlike web's React context)
under fixed keys (`access_token`, `refresh_token`, `rbac_token`, `device_token`, `user_token`,
`session_user`). Also owns `refreshAccessToken()` — the client-side entry point that calls
`refresh_token.dart` and, critically, **persists the rotated rbac/device/user/refresh tokens the
backend returns**, not just the new access token; the extensive inline comments in both this file and
`refresh_token.dart` explain why skipping that persistence turns a successful refresh into a silent
next-request 401. See [README.md § State](./README.md#state) for how each of the 6 screens uses this
provider.

## Known issues

- ⚠ **`currentUserProvider` is defined twice, incompatibly.** `api/client/auth/queries.dart` defines
  a `FutureProvider<AuthenticatedUser>` under this name (fresh GraphQL `me` fetch every read); an
  **entirely separate** `Provider<AuthenticatedUser?>` with the same name lives in
  [`hooks/use_auth.dart`](../../../flutter-boilerplate/lib/hooks/use_auth.dart) (synchronous, derived
  from the locally-cached session in `authProvider`). Every real call site in the app (~20, spanning
  messages, feed, settings, this vertical's own `verify_email/page_content.dart`) imports
  `hooks/use_auth.dart` and gets the synchronous version. The `queries.dart` version's only reference
  anywhere is a re-export in [`lib/api/index.dart`](../../../flutter-boilerplate/lib/api/index.dart) —
  confirmed via a repo-wide grep, it is never read/watched. Dead code with a confusable name, same
  family as [BE-002](../../issues.md#be-002). Filed in [`issues.md`](../../issues.md).
- The underlying `me` GraphQL query itself is **not** dead — `me.dart`'s `MeServer.call()` is called
  directly (bypassing the dead `queries.dart` wrapper) from `settings/account/page_view.dart`, out of
  scope for this pass.
