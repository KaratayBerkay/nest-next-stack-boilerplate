# Reset password (page)

**Route:** `/auth/reset-password?token=` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/auth/reset-password/page.tsx)
**Layout:** shared [`app/auth/layout.tsx`](../../../../next-js-boilerplate/src/app/auth/layout.tsx)
**Mobile equivalent:** [reset-password screen](../../../mobile/auth/reset-password/screen.md)

## What renders here

Server component — reads `?token=` from `searchParams`, passes it as a prop to `ResetPasswordForm`
([`reset-password-form.tsx`](../../../../next-js-boilerplate/src/features/auth/ui/reset-password-form.tsx)).
No `?token=` present → the form itself renders a "token missing" message rather than the page doing
that check.

Folded into this page doc, not a separate component file — same reasoning as
[register](../register/page.md)'s `RegisterForm`: one form, no distinct sub-states.

## Components

- Renders [`PasswordRequirements`](../register/components/password-requirements.md) (shared with
  register, documented there).

## Behavior notes

- Password + confirm-password, both required; [`resetPasswordFormSchema`](../../../../next-js-boilerplate/src/validators/auth/schema.ts)
  enforces the same complexity rules as registration (length 8-128, lower/upper/number) plus a
  `password === confirmPassword` refinement.
- On success, waits 2 seconds (`setTimeout`) showing a success message before redirecting to
  `/auth/login` — not an immediate `router.push`.

## Hooks & API

No hook — calls its one API function directly. See [../api.md](../api.md).

## Calls

| Action | Via | Backend endpoint |
|---|---|---|
| Submit new password | `resetPasswordServer(token, password)` (direct import) | [Reset password](../../../backend/identity-access/auth/endpoints.md#reset-password) |

```
ResetPasswordForm
  → resetPasswordServer()                  — src/api/server/auth/reset-password.ts
    → backend: POST /api/auth/reset-password (BFF) → GraphQL `resetPassword` mutation
```

## Known issues affecting this page

- No Flutter parity for the live password-requirements checklist here either — see
  [password-requirements.md § Known issues](../register/components/password-requirements.md#known-issues).
