# Login (screen)

**Route:** `/auth/login` (GoRouter name `login`)
**Router registration:** [`router.dart#L249-L252`](../../../../flutter-boilerplate/lib/app/router.dart) —
`GoRoute(path: '/auth/login', name: 'login', builder: (_, __) => const LoginPageContent())`, under
the explicit `// Auth routes` comment block, registered **before** (and separately from) the
`// V1 authenticated shell` `ShellRoute` — confirmed not nested under `/v1/:lang/`.
**Entry widget:** `LoginPageContent` in
[`page_content.dart`](../../../../flutter-boilerplate/lib/views/auth/login/page_content.dart)
**Web equivalent:** [login page](../../../frontend/auth/login/page.md)

## What renders here

One `ConsumerStatefulWidget`, one `State` class — unlike web's `LoginForm`/`LoginCredentialsForm`/
`MfaChallengeForm` three-file split, credentials and MFA-challenge are two private builder methods
(`_buildForm`/`_buildMfaState`) on the **same** State class, switched on a local `_mfaMode` bool. No
separate widget files for this vertical's per-page state machines — see
[README.md](../README.md) for why this doc set still gives login a `widgets/` folder (one shared
component, not a state-split).

```
LoginPageContent (build)
  authState.when(
    loading  → placeholder
    error    → error text
    data(user):
      user != null   → "signed in as" text
      _mfaMode       → _buildMfaState()   (TOTP/email/backup-code challenge)
      else           → _buildForm()       (email + password)
  )
```

## MFA state — richer than web's

`_buildMfaState` includes everything web's `MfaChallengeForm` has (6-digit `InputOtp`, email-method
resend with a cooldown timer, "trust this device" checkbox, "use a different account" link) **plus**
a `_backupCodeMode` toggle absent from web: switches the input from the 6-digit `InputOtp` to a
free-text `LabeledField` (6-10 chars, hex-filtered) for entering an MFA backup code instead of a TOTP
code. See [Known issues](#known-issues) — this is a real, one-directional parity gap (mobile ahead of
web here, the reverse of most gaps this doc set has found).

## Widgets

Only one significant, screen-local widget:

- [social-login-buttons.md](./widgets/social-login-buttons.md) — OAuth provider buttons
  (`social_login_buttons.dart`); this is the **only** screen in the whole app that renders it (see
  [register/screen.md § Known issues](../register/screen.md#known-issues))

Shared, generic form primitives (`AuthLayout`, `LabeledField`, `LinkText` — all
[`lib/components/auth/`](../../../../flutter-boilerplate/lib/components/auth/)) are used by every
screen in this vertical and not documented as screen-specific, same treatment web gives its
`components/ui/` primitives.

## State

[`authProvider`](../../../../flutter-boilerplate/lib/hooks/use_auth.dart) — this screen calls
`authProvider.notifier.setSession(...)` on both password-login success and MFA-verify success, and
separately persists the refresh token via `setRefreshToken()`. See [api.md § Session state](../api.md#session-state-authprovider).

## Calls

| Action | Via | Backend endpoint |
|---|---|---|
| Submit email + password | `loginActionsProvider.login()` | [Log in](../../../backend/identity-access/auth/endpoints.md#log-in) |
| Submit MFA code (TOTP, email, or backup) | `loginActionsProvider.verifyLoginMfa()` | [Verify a login MFA code](../../../backend/identity-access/auth/endpoints.md#verify-a-login-mfa-code) |
| Resend MFA code | `loginActionsProvider.resendLoginCode()` | [Resend a login MFA code](../../../backend/identity-access/auth/endpoints.md#resend-a-login-mfa-code) |
| "Trust this device" on success | `trustDeviceServerProvider` — **out of scope** (`sessions` vertical), best-effort | [Trust the current device](../../../backend/identity-access/sessions/endpoints.md#trust-the-current-device) |
| Continue with a social provider | see [social-login-buttons.md](./widgets/social-login-buttons.md) | [Log in with OAuth](../../../backend/identity-access/auth/endpoints.md#log-in-with-oauth) |

All calls go directly to the backend — see [api.md § Shape per file](../api.md#shape-per-file).

## Known issues

- ⚠ **Mobile has an MFA backup-code UI web lacks** — the reverse of most parity gaps found in this
  doc set. Filed as [CROSS-009](../../../issues.md#cross-009) — see
  [frontend login/components/mfa-challenge-form.md § Known issues](../../../frontend/auth/login/components/mfa-challenge-form.md#known-issues)
  for the full evidence.
