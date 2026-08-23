# Verify email (screen)

**Route:** `/auth/verify-email?token=` or `?userId=` (GoRouter name `verifyEmail`)
**Router registration:** [`router.dart#L277-L284`](../../../../flutter-boilerplate/lib/app/router.dart) —
`token`/`userId` both read from query params; **no `email` param is read here** (contrast with web,
which also threads `email` — see [Known issues](#known-issues))
**Entry widget:** `VerifyEmailPageContent` in
[`page_content.dart`](../../../../flutter-boilerplate/lib/views/auth/verify_email/page_content.dart)
**Web equivalent:** [verify-email page](../../../frontend/auth/verify-email/page.md)

## What renders here

Same two-mode design as web, one file: `_hasToken` (token present) vs. `_codeMode` (`!_hasToken &&
userId.isNotEmpty`). Token mode auto-verifies via a `Future.microtask` scheduled from `initState`
(explicitly **not** inline in `build()` — the code comment explains this used to reissue the
single-use token on every rebuild and trip a "setState called during build" assertion). Code mode
renders a 6-digit `InputOtp` + resend link + a "skip for now" link to `/v1/{lang}/feed`.

## Behavior notes

- **Resend needs an email address the router never gave it.** `_resendCode()` calls
  `actions.resendEmailCode(widget.userId, ref.read(currentUserProvider)?.email ?? '')` — falling back
  to whatever email the current session snapshot holds, since this screen has no `email` constructor
  param at all (only `token`/`userId`). This works in the normal flow (register just called
  `setSession()`, so `currentUserProvider` — the synchronous one from
  [`hooks/use_auth.dart`](../../../../flutter-boilerplate/lib/hooks/use_auth.dart), see
  [api.md § Known issues](../api.md#known-issues) for why it matters which `currentUserProvider` this
  is — already holds the right user) but would silently send an empty `email` if this screen were
  ever reached without an active session (e.g. a stale code-mode deep link after logging out).
- "Skip for now" reads the locale from `localeProvider` and navigates to `/v1/{locale}/feed` directly
  — verify-email is not a hard gate on app access, matching the backend's own "registration already
  logged you in" behavior (see [backend README.md](../../../backend/identity-access/auth/README.md#registration-login-and-password-flows)).

## Calls

| Action | Mode | Via | Backend endpoint |
|---|---|---|---|
| Auto-verify on mount | token | `loginActionsProvider.verifyEmail()` | [Verify email](../../../backend/identity-access/auth/endpoints.md#verify-email) |
| Submit 6-digit code | code | `loginActionsProvider.verifyEmailCode()` | [Verify email with a code](../../../backend/identity-access/auth/endpoints.md#verify-email-with-a-code) |
| Resend code | code | `loginActionsProvider.resendEmailCode()` | [Resend the email verification code](../../../backend/identity-access/auth/endpoints.md#resend-the-email-verification-code) |

## Known issues

- The [register screen](../register/screen.md) navigates here with only `?userId=` (no `?email=`,
  unlike web's redirect, which includes both) — not a functional bug given the `currentUserProvider`
  fallback above, but worth knowing if this screen is ever reached via a different entry point that
  doesn't already have an active session.
