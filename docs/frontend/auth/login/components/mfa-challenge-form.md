# MfaChallengeForm

**Source:** [`MfaChallengeForm.tsx`](../../../../../next-js-boilerplate/src/features/auth/ui/MfaChallengeForm.tsx)
**Used in:** [login page](../page.md), rendered by `LoginForm` once `login()` throws an
`mfaRequired` error
**Mobile equivalent:** [login screen](../../../../mobile/auth/login/screen.md)'s `_buildMfaState`
(folded into the same screen file — and, unlike this component, includes a backup-code toggle; see
Known issues)

## Purpose

The post-password MFA challenge screen: 6-digit `InputOTP` (or a text field, in "backup code" mode —
see Known issues), a resend link (email method only, with a client-side cooldown timer), a "trust
this device" checkbox, and a "use a different account" escape hatch back to
[`LoginCredentialsForm`](./login-credentials-form.md). Client component (`"use client"`).

## Props (`MfaChallengeFormProps`)

| Prop | Purpose |
|---|---|
| `mfaState` | `{mfaToken, mfaMethod, user}` from `LoginForm`'s local state |
| `verifyMfa` | from `useAuth()` |
| `setMfaState` | so a resend can replace `mfaToken` with the rotated one the backend returns |
| `onBackToCredentials` | clears `LoginForm`'s `mfaState`, returning to the credentials form |

## Behavior notes

- **Resend rotates the token.** [Resend a login MFA code](../../../../backend/identity-access/auth/endpoints.md#resend-a-login-mfa-code)
  returns a **new** `mfaToken`; this component immediately swaps it into `mfaState` (`setMfaState({
  ...mfaState, mfaToken })`) — the old one is server-side consumed the instant the resend succeeds, so
  a stale copy would 401 the next verify attempt with `EX_AUTH_MFA_EXPIRED`.
- **Cooldown is client-only UI**, driven by a local `cooldownEnd` timestamp + a 1s `setInterval` — the
  real cooldown enforcement is [`EmailOtpService`](../../../../backend/identity-access/auth/README.md)'s
  server-side 60s window; this timer just disables the resend button in step with it, and would drift
  independently on its own if the two ever disagreed.
- **"Trust this device"** is best-effort and non-blocking: on successful verify, if checked, this
  calls `trustDeviceServer()` (`@/api/server/sessions/trust-device`) — backed by
  [Trust the current device](../../../../backend/identity-access/sessions/endpoints.md#trust-the-current-device)
  — inside a `try/catch` that swallows failure, since login has already succeeded by that point
  regardless.
- Uses `InputOTP`, `Label`, `Button`, `Checkbox` (all `components/ui/`).

## Known issues

- ⚠ **No backup-code entry path.** This form only ever renders a 6-digit `InputOTP` bound to TOTP or
  email codes. The backend's `verifyLoginMfa` accepts a 6-10 char code and tries TOTP first, then
  falls back to a one-time backup code transparently (see
  [backend endpoints.md § Verify a login MFA code](../../../../backend/identity-access/auth/endpoints.md#verify-a-login-mfa-code))
  — but there is no way to *reach* that fallback from this UI, since the `InputOTP` caps input at 6
  digits and there's no toggle to a longer free-text field. **Flutter's equivalent screen has exactly
  this toggle** (`_backupCodeMode` in
  [`login/page_content.dart`](../../../../../flutter-boilerplate/lib/views/auth/login/page_content.dart)),
  so a user who lost their authenticator device can complete login on mobile but not on web. Filed as
  `CROSS-009` (resolved).

## Calls

`verifyMfa` and the resend action resolve to:

```
MfaChallengeForm (verifyMfa prop)
  → useAuth().verifyMfa()                  — src/features/auth/hooks/useAuth.tsx
    → verifyMfaServer()                    — src/api/server/auth/mfa.ts
      → backend: POST /api/auth/login/mfa (BFF) → GraphQL `verifyLoginMfa` mutation

MfaChallengeForm (onResend → resendLoginCodeServer, called directly, not via useAuth)
  → src/api/server/auth/mfa.ts
    → backend: POST /api/auth/login/mfa/resend (BFF) → GraphQL `resendLoginCode` mutation

MfaChallengeForm ("trust this device" checkbox, on successful verify)
  → trustDeviceServer()                    — src/api/server/sessions/trust-device.ts (sessions vertical, out of scope)
    → backend: POST /api/auth/trust-device (BFF) → GraphQL `trustCurrentDevice` mutation
```

- Hook: [hooks.md](../../hooks.md)
- Frontend BFF: [api.md § `mfa.ts`](../../api.md#mfats--split-file-only-2-of-5-exports-are-in-scope)
- Backend: [Verify a login MFA code](../../../../backend/identity-access/auth/endpoints.md#verify-a-login-mfa-code),
  [Resend a login MFA code](../../../../backend/identity-access/auth/endpoints.md#resend-a-login-mfa-code),
  [Trust the current device](../../../../backend/identity-access/sessions/endpoints.md#trust-the-current-device)
