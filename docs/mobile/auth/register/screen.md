# Register (screen)

**Route:** `/auth/register` (GoRouter name `register`)
**Router registration:** [`router.dart#L253-L257`](../../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `RegisterPageContent` in
[`page_content.dart`](../../../../flutter-boilerplate/lib/views/auth/register/page_content.dart)
**Web equivalent:** [register page](../../../frontend/auth/register/page.md)

## What renders here

One `ConsumerStatefulWidget`/`State`, one form: optional name, required email, required password (8+
chars checked client-side; no upper bound check client-side despite the backend's 128-char cap — see
[Known issues](#known-issues)). No MFA-equivalent branch, no tier gate.

On success: `authProvider.notifier.setSession(...)` + `setRefreshToken()`, then navigates to
`/auth/verify-email?userId={id}` — no `email` query param passed (contrast with web's redirect, which
includes both `userId` **and** `email`; verify-email's code-mode needs `email` to call
`resendEmailCode`, and this screen falls back to
`ref.read(currentUserProvider)?.email ?? ''` to recover it — see
[verify-email/screen.md](../verify-email/screen.md)).

## Widgets

No screen-specific widgets — the whole screen is one build method, same "fold into the page/screen
doc" treatment as web's `RegisterForm`.

## State

[`authProvider`](../../../../flutter-boilerplate/lib/hooks/use_auth.dart) — same as
[login](../login/screen.md).

## Calls

| Action | Via | Backend endpoint |
|---|---|---|
| Submit the form | `loginActionsProvider.register()` | [Register](../../../backend/identity-access/auth/endpoints.md#register) |

No social-login call — see Known issues.

## Known issues

- ⚠ **No social-login option at all.** [`SocialLoginButtons`](../login/widgets/social-login-buttons.md)
  is imported and rendered only by [login/page_content.dart](../login/screen.md) — confirmed via a
  repo-wide grep, this is its only call site. Web's register page renders the same
  `SocialLoginButtons` component login does. A user who wants to sign up with Google/GitHub/etc. can
  only do so from the mobile login screen, not the register screen (functionally reachable, since
  `loginWithOAuth` creates a new account on first use — but the entry point is missing, and the
  register screen's own copy/framing never mentions it). Filed as `CROSS-010` (resolved).
- ⚠ **No live password-requirements checklist and no password reveal toggle** — filed as
  `CROSS-011` (resolved); see
  [frontend password-requirements.md § Known issues](../../../frontend/auth/register/components/password-requirements.md#known-issues)
  for the full evidence (traced to a single web+backend-only commit, `d4fee7ce`). This screen's own
  client-side check (`password.length > 128` → `authErrorsPasswordMax`) still exists and matches the
  backend's cap — only the *live-as-you-type* checklist and the show/hide icon are missing, not
  server-side enforcement.
