# Auth (mobile)

**Source:** [`flutter-boilerplate/lib/views/auth/`](../../../flutter-boilerplate/lib/views/auth/) ·
**Backend:** [identity-access/auth](../../backend/identity-access/auth/README.md) ·
**Web equivalent:** [frontend/auth](../../frontend/auth/README.md)

## Why this isn't under `v1/`

Mirrors the frontend: all 6 routes are registered directly on the root `GoRouter`, under an explicit
`// Auth routes` comment block in
[`router.dart`](../../../flutter-boilerplate/lib/app/router.dart#L248-L284), **before and separate
from** the `// V1 authenticated shell` `ShellRoute` that wraps every `/v1/:lang/...` screen. Verified
by reading the router directly, not assumed from the frontend's own layout — same routes
(`/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`,
`/auth/undo-password-change`, `/auth/verify-email`), same kebab-case URL segments as web even though
the Dart source folders are snake_cased (`forgot_password`, `reset_password`, `undo_password_change`,
`verify_email`) — see [conventions.md § 1](../../conventions.md#1-folder-structure-rule).

## Screens

6 screens under [`lib/views/auth/`](../../../flutter-boilerplate/lib/views/auth/), each one
`ConsumerStatefulWidget` file (no separate "screen + form" split the way web sometimes has one) —
see each screen doc for whether it has its own `widgets/` folder:

| Route | Doc | Entry widget | Backend flow |
|---|---|---|---|
| `/auth/login` | [login/screen.md](./login/screen.md) | `LoginPageContent` | [Log in](../../backend/identity-access/auth/endpoints.md#log-in), [MFA challenge](../../backend/identity-access/auth/endpoints.md#verify-a-login-mfa-code) (incl. backup codes), [OAuth](../../backend/identity-access/auth/endpoints.md#log-in-with-oauth) |
| `/auth/register` | [register/screen.md](./register/screen.md) | `RegisterPageContent` | [Register](../../backend/identity-access/auth/endpoints.md#register) |
| `/auth/forgot-password` | [forgot-password/screen.md](./forgot-password/screen.md) | `ForgotPasswordPageContent` | [Request a password reset](../../backend/identity-access/auth/endpoints.md#request-a-password-reset) |
| `/auth/reset-password` | [reset-password/screen.md](./reset-password/screen.md) | `ResetPasswordPageContent` | [Reset password](../../backend/identity-access/auth/endpoints.md#reset-password) |
| `/auth/verify-email` | [verify-email/screen.md](./verify-email/screen.md) | `VerifyEmailPageContent` | [Verify email](../../backend/identity-access/auth/endpoints.md#verify-email) / [with a code](../../backend/identity-access/auth/endpoints.md#verify-email-with-a-code) |
| `/auth/undo-password-change` | [undo-password-change/screen.md](./undo-password-change/screen.md) | `UndoPasswordChangePageContent` | [Undo a password change](../../backend/identity-access/auth/endpoints.md#undo-a-password-change) |

## State

No page-level hook object the way web's [`useAuth`](../../frontend/auth/hooks.md) is one — Riverpod
providers fill that role, split across two files:

- [`hooks/use_auth.dart`](../../../flutter-boilerplate/lib/hooks/use_auth.dart)'s **`authProvider`**
  (`StateNotifierProvider<AuthNotifier, AsyncValue<AuthenticatedUser?>>`) — the real session state
  every one of the 6 screens reads/writes, persisted to `flutter_secure_storage` (not just in-memory,
  unlike web's React context). Owns `setSession`, `logout`, `refreshAccessToken`, and the derived
  `currentUserProvider`/`isAuthenticatedProvider`/`userTierProvider` read-only providers.
- [`api/client/auth/actions.dart`](../../../flutter-boilerplate/lib/api/client/auth/actions.dart)'s
  **`loginActionsProvider`** — the network-call layer every screen's submit handler goes through (see
  [api.md](./api.md)).

See [api.md § Session state](./api.md#session-state-authprovider) for the token-persistence detail
that matters most: a refresh rotates *four* tokens, not just the access token, and all four must be
persisted or the next request silently 401s.

## API

[api.md](./api.md) — **confirmed zero Next.js involvement for this entire vertical**, same conclusion
as [messages](../v1/messages/api.md): all 12 `lib/api/server/auth/*.dart` files call the NestJS
backend directly (11 via `/graphql`, 1 — device handshake — via a REST path matching the backend's
own native route). See
[conventions.md § 9](../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement).

## Confirmed parity gaps vs. web (found while documenting these screens)

- ⚠ **Register has no social-login option** — [`SocialLoginButtons`](./login/widgets/social-login-buttons.md)
  is wired into the login screen only; web renders it on both login and register. See
  [register/screen.md § Known issues](./register/screen.md#known-issues).
- ⚠ **No live password-requirements checklist, no password reveal toggle** — traced to a single
  web+backend-only commit (`d4fee7ce`, confirmed via `git show --stat` touching zero
  `flutter-boilerplate` files). See
  [frontend password-requirements.md § Known issues](../../frontend/auth/register/components/password-requirements.md#known-issues).
- ⚠ **Reverse-direction gap: mobile's login screen has an MFA backup-code entry path web lacks.** See
  [frontend mfa-challenge-form.md § Known issues](../../frontend/auth/login/components/mfa-challenge-form.md#known-issues).
- ⚠ `currentUserProvider` is defined twice with incompatible types (one dead) — an internal mobile
  footgun, not a web/mobile parity gap. See [api.md § Known issues](./api.md#known-issues).

## Known issues

Full findings with severity and evidence are filed in [`issues.md`](../../issues.md).
