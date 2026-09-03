# Auth (frontend)

**Source:** [`next-js-boilerplate/src/app/auth/`](../../../next-js-boilerplate/src/app/auth/) ·
**Real implementation:** [`src/features/auth/`](../../../next-js-boilerplate/src/features/auth/)
(except [forgot-password](./forgot-password/page.md) — see its own doc) ·
**Backend:** [identity-access/auth](../../backend/identity-access/auth/README.md)

## Why this isn't under `v1/`

Every other documented frontend vertical lives at `docs/frontend/v1/<page>/`, mirroring
`next-js-boilerplate/src/app/v1/[lang]/<page>/`. This vertical doesn't, because its real source
doesn't either: `src/app/auth/` is a **separate, top-level route group** — pre-session, ungated
(no `SessionAuthGuard`-equivalent redirect for most of these pages; only [login](./login/page.md)
redirects an already-signed-in visitor away), and **not localized by route** (no `[lang]` segment;
these pages read the `LANG_COOKIE` directly where they need a locale — see
[login-credentials-form.md](./login/components/login-credentials-form.md)). See
`CROSS-003` (resolved — fixed 2026-09-03: documentation-only note, no code change intended) for the same "the URL doesn't imply a versioning/localization
guarantee" caution applied elsewhere.

## Pages

6 pages under [`src/app/auth/`](../../../next-js-boilerplate/src/app/auth/), all sharing one layout
([`app/auth/layout.tsx`](../../../next-js-boilerplate/src/app/auth/layout.tsx) — centered card, lang
switcher, theme toggle):

| Route | Doc | Real form component | Backend flow |
|---|---|---|---|
| `/auth/login` | [login/page.md](./login/page.md) | `LoginCredentialsForm` + `MfaChallengeForm` (`features/auth/ui/`) | [Log in](../../backend/identity-access/auth/endpoints.md#log-in), [MFA challenge](../../backend/identity-access/auth/endpoints.md#verify-a-login-mfa-code), [OAuth](../../backend/identity-access/auth/endpoints.md#log-in-with-oauth) |
| `/auth/register` | [register/page.md](./register/page.md) | `RegisterForm` (`features/auth/ui/`) | [Register](../../backend/identity-access/auth/endpoints.md#register) |
| `/auth/forgot-password` | [forgot-password/page.md](./forgot-password/page.md) | `ForgotPasswordContent` — ⚠ **note the different folder**, `views/auth/`, not `features/auth/ui/` | [Request a password reset](../../backend/identity-access/auth/endpoints.md#request-a-password-reset) |
| `/auth/reset-password` | [reset-password/page.md](./reset-password/page.md) | `ResetPasswordForm` (`features/auth/ui/`) | [Reset password](../../backend/identity-access/auth/endpoints.md#reset-password) |
| `/auth/verify-email` | [verify-email/page.md](./verify-email/page.md) | `VerifyEmailForm` (`features/auth/ui/`) | [Verify email](../../backend/identity-access/auth/endpoints.md#verify-email) / [with a code](../../backend/identity-access/auth/endpoints.md#verify-email-with-a-code) |
| `/auth/undo-password-change` | [undo-password-change/page.md](./undo-password-change/page.md) | `UndoPasswordChangeForm` (`features/auth/ui/`) | [Undo a password change](../../backend/identity-access/auth/endpoints.md#undo-a-password-change) |

## Shared, vertical-wide docs

Unlike a single-page vertical (e.g. [messages](../v1/messages/page.md)), this folder's `hooks.md` and
`api.md` live at the vertical root rather than nested in one page's folder — see
[conventions.md § 2](../../conventions.md#2-file-naming)'s "one combined doc per vertical" — since
the underlying code is shared across some pages but not others, not neatly 1:1 with any single page:

- [hooks.md](./hooks.md) — `useAuth`/`AuthProvider`/`SessionHydrator`, the app-wide session context
  (used well beyond just these 6 pages)
- [api.md](./api.md) — all 15 `api/client` + `api/server` files, with a table showing exactly which
  of the 6 pages (if any) calls each one

Two components are shared across pages and documented where first introduced rather than duplicated:
[`SocialLoginButtons`](./login/components/social-login-buttons.md) (login + register) and
[`PasswordRequirements`](./register/components/password-requirements.md) (register + reset-password).

## Out of scope, but adjacent

`src/api/server/auth/change-password.ts` and half of `mfa.ts` (`enrollMfaServer`/
`verifyMfaEnrollmentServer`/`disableMfaServer`) back the `settings/security` page's change-password
and MFA-enrollment UI — a different vertical, not documented here beyond the API/backend entries these
files share with in-scope flows. See [api.md](./api.md) for exactly which exports are in vs. out of
scope.

## Known issues

- ⚠ [`src/views/auth/`](../../../next-js-boilerplate/src/views/auth/) is not dead code — its one file
  is the real forgot-password implementation, just organized outside the `features/auth/ui/` pattern
  every other page follows. See [forgot-password/page.md § Known issues](./forgot-password/page.md#known-issues).
- `FE-002` (resolved 2026-09-03): the forms-gallery demo's `"use server"` Tanstack-form action used to
  sit at `src/features/auth/actions/signup.ts`, where it read as the real registration path. It now
  lives with its only caller as
  [`views/(demos)/form/signup-action.ts`](../../../next-js-boilerplate/src/views/(demos)/form/signup-action.ts)
  (options alongside it, schema under `validators/demos/`); `features/auth/` no longer has an
  `actions/` directory. Real registration is `RegisterForm` → `useAuth().register()` → `registerServer()`.
- ⚠ `me-raw.ts`'s response type doesn't match reality, and `meQueryOptions()` is dead code — see
  [api.md § Known issues](./api.md#known-issues).
- ⚠ No UI path to an MFA backup code on web (Flutter has one) — see
  [login/components/mfa-challenge-form.md § Known issues](./login/components/mfa-challenge-form.md#known-issues).
- Full findings with severity are filed in [`issues.md`](../../issues.md).
