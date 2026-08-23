# Forgot password (screen)

**Route:** `/auth/forgot-password` (GoRouter name `forgotPassword`)
**Router registration:** [`router.dart#L258-L262`](../../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `ForgotPasswordPageContent` in
[`page_content.dart`](../../../../flutter-boilerplate/lib/views/auth/forgot_password/page_content.dart) —
note the snake_case source folder (`forgot_password`) vs. this doc's kebab-case folder
(`forgot-password`), matching the frontend's URL segment — see
[conventions.md § 1](../../../conventions.md#1-folder-structure-rule).
**Web equivalent:** [forgot-password page](../../../frontend/auth/forgot-password/page.md)

## What renders here

One `ConsumerStatefulWidget`/`State`: an email field, a submit button, and a success view swapped in
via a local `_sent` bool (`AuthLayout(child: _sent ? _buildSent(t) : _buildForm(t))`).

## Behavior notes

- Client-side check is presence-only (`email.isEmpty`) — no format validation, matching web.
- Always shows the success view regardless of whether the email matched an account, mirroring the
  backend's deliberate email-enumeration defense (see
  [backend endpoints.md § Request a password reset](../../../backend/identity-access/auth/endpoints.md#request-a-password-reset)).

## Calls

| Action | Via | Backend endpoint |
|---|---|---|
| Submit email | `loginActionsProvider.requestPasswordReset()` | [Request a password reset](../../../backend/identity-access/auth/endpoints.md#request-a-password-reset) |

## Known issues

None specific to this screen found in this pass.
