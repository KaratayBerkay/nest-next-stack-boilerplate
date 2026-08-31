# Login (page)

**Route:** `/auth/login` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/auth/login/page.tsx)
**Layout:** shared [`app/auth/layout.tsx`](../../../../next-js-boilerplate/src/app/auth/layout.tsx) —
centered card, lang switcher + theme toggle, wraps every page in this vertical (`AuthLayout`, not to
be confused with the Flutter widget of the same name — see [mobile README.md](../../../mobile/auth/README.md)).
**Mobile equivalent:** [login screen](../../../mobile/auth/login/screen.md)

## What renders here

Server component. If a session already exists (`getSessionUser()`), redirects straight to
`/v1/{lang}/feed` — this page never renders anything for an already-signed-in visitor. Otherwise
renders two independently-suspended client components:

```
LoginPage
├─ LoginForm          (Suspense: PulseBlockFallback)
└─ SocialLoginButtons  (Suspense: PulseSmallBlockFallback)
```

`LoginForm` ([`login-form.tsx`](../../../../next-js-boilerplate/src/features/auth/ui/login-form.tsx))
is a thin, 3-state dispatcher — not itself a form:

| `useAuth()` state | Renders |
|---|---|
| `loading` | a loading line |
| `user` present | "signed in as {email}" (reachable only in the brief window before the server redirect above would normally have fired, or if session state changes client-side) |
| neither, `mfaState` set | [`MfaChallengeForm`](./components/mfa-challenge-form.md) |
| neither, `mfaState` null | [`LoginCredentialsForm`](./components/login-credentials-form.md) |

`mfaState` (`{mfaToken, mfaMethod, user}`) is `LoginForm`'s own local `useState` — the switch between
credentials and MFA challenge is page-local UI state, not anything the backend or `useAuth` tracks.

## Components

Route folder gets its own `components/` since two of its three real pieces are significant enough for
their own doc (the third, `LoginForm` above, is a trivial dispatcher folded into this page doc):

- [login-credentials-form.md](./components/login-credentials-form.md) — the actual email/password
  form (`LoginCredentialsForm.tsx`)
- [mfa-challenge-form.md](./components/mfa-challenge-form.md) — the TOTP/email/backup-code challenge
  screen (`MfaChallengeForm.tsx`)
- [social-login-buttons.md](./components/social-login-buttons.md) — OAuth provider buttons
  (`social-login-buttons.tsx`/`social-login-button.tsx`), documented here since login is where it's
  first introduced; also used by [register](../register/page.md)

## Hooks & API

- [../hooks.md](../hooks.md) — `useAuth()`'s `login`/`verifyMfa` methods drive this page end to end
- [../api.md](../api.md) — full client/server API map

## Calls

| Action | Via | Backend endpoint |
|---|---|---|
| Submit email + password | `useAuth().login()` → [`login.ts`](../api.md) | [Log in](../../../backend/identity-access/auth/endpoints.md#log-in) |
| Submit MFA code (or backup code) | `useAuth().verifyMfa()` → [`mfa.ts`](../api.md#mfats--split-file-only-2-of-5-exports-are-in-scope) | [Verify a login MFA code](../../../backend/identity-access/auth/endpoints.md#verify-a-login-mfa-code) |
| Resend MFA code | `resendLoginCodeServer()` → [`mfa.ts`](../api.md#mfats--split-file-only-2-of-5-exports-are-in-scope) | [Resend a login MFA code](../../../backend/identity-access/auth/endpoints.md#resend-a-login-mfa-code) |
| "Trust this device" checkbox on success | `trustDeviceServer()` from `@/api/server/sessions/trust-device` — **out of scope** (`sessions` vertical), lazy-imported and best-effort (failure doesn't block login) | *(sessions vertical, not documented here)* |
| Continue with a social provider | full-page navigation, no fetch — see [social-login-buttons.md](./components/social-login-buttons.md) | [Log in with OAuth](../../../backend/identity-access/auth/endpoints.md#log-in-with-oauth) |

## Known issues affecting this page

- ⚠ No UI path to submit an MFA **backup code** — `MfaChallengeForm` only ever renders a 6-digit
  `InputOTP` for TOTP/email codes, even though the backend's `verifyLoginMfa` accepts a backup code
  interchangeably (6-10 chars). Flutter's login screen has an explicit "use a backup code instead"
  toggle with no web equivalent. Filed as `CROSS-009` (resolved) — see
  [mfa-challenge-form.md](./components/mfa-challenge-form.md#known-issues) for the full evidence.
