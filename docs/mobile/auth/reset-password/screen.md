# Reset password (screen)

**Route:** `/auth/reset-password?token=` (GoRouter name `resetPassword`)
**Router registration:** [`router.dart#L263-L269`](../../../../flutter-boilerplate/lib/app/router.dart) —
`token: state.uri.queryParameters['token'] ?? ''`
**Entry widget:** `ResetPasswordPageContent` in
[`page_content.dart`](../../../../flutter-boilerplate/lib/views/auth/reset_password/page_content.dart)
**Web equivalent:** [reset-password page](../../../frontend/auth/reset-password/page.md)

## What renders here

One `ConsumerStatefulWidget`/`State`. No `token` → a static "token missing" message (no form at all,
same as web). Otherwise: password + confirm-password fields, a submit button, then a success view
(`_done` bool) that auto-navigates to `/auth/login` after a 2-second `Timer`, matching web's
`setTimeout` redirect.

## Behavior notes

- Client-side validation: non-empty, ≥8 chars, `confirm == password` — checked in that order,
  `setState` per-failure rather than collecting all errors at once (contrast with web's Zod schema,
  which reports all field errors simultaneously). No password-complexity (upper/lower/digit) check
  client-side, and no live-requirements checklist — see Known issues.

## Calls

| Action | Via | Backend endpoint |
|---|---|---|
| Submit new password | `loginActionsProvider.resetPassword()` | [Reset password](../../../backend/identity-access/auth/endpoints.md#reset-password) |

## Known issues

- ⚠ No live password-requirements checklist or reveal toggle — see
  [frontend password-requirements.md § Known issues](../../../frontend/auth/register/components/password-requirements.md#known-issues).
- Client-side validation here doesn't check the upper/lower/digit complexity rule the backend's DTO
  enforces (only length ≥8) — a password that's long enough but fails complexity will pass this
  screen's own check and only get rejected after the round trip to the backend, surfacing as the
  generic `authErrorsResetPasswordFailed` message rather than a specific complexity hint. Web's
  equivalent Zod schema checks complexity client-side. Not independently filed as a severity-rated
  issue in this pass (UX-only, no correctness/security impact — the backend still enforces the real
  rule) but worth fixing alongside the checklist gap above.
