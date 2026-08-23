# Forgot password (page)

**Route:** `/auth/forgot-password` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/auth/forgot-password/page.tsx)
**Layout:** shared [`app/auth/layout.tsx`](../../../../next-js-boilerplate/src/app/auth/layout.tsx)
**Mobile equivalent:** [forgot-password screen](../../../mobile/auth/forgot-password/screen.md)

## What renders here

Server component, renders one client component: `ForgotPasswordContent`.

## ⚠ Where the real implementation actually lives

`ForgotPasswordContent` is imported from
[`@/views/auth/forgot-password/PageContent`](../../../../next-js-boilerplate/src/views/auth/forgot-password/PageContent.tsx)
— **not** from `src/features/auth/ui/`, where every other page's real form component lives. This is
the *only* file in `src/views/auth/` (confirmed: `find next-js-boilerplate/src/views/auth -type f`
returns exactly this one path). An earlier research pass in this same documentation effort described
`src/views/auth/` as "a 1-file stub" — that's true of the file *count*, but the one file is not a
stub: it's the complete, real, load-bearing implementation of this page (state, validation, submit
handler, success view — everything `reset-password-form.tsx` or `verify-email-form.tsx` has, just in
a different folder). Filed as an issues.md correction — see [Known issues](#known-issues) below.

Self-contained: a single component holds `email`/`fieldErrors`/`submitting`/`submitted` state, no
props from the page, no split between a "page" and a "form" file.

## Behavior notes

- **Client-side email presence check only** — `if (!email) setFieldErrors({email: ...})`; no format
  validation (contrast with [login](../login/page.md)/[register](../register/page.md), which run a
  Zod email-shape check before submitting). Any format is sent to the backend as-is.
- **Always shows a success message**, even for an email with no matching account — this isn't a
  frontend choice, it mirrors the backend's own deliberate email-enumeration defense (see
  [Request a password reset](../../../backend/identity-access/auth/endpoints.md#request-a-password-reset),
  which always resolves `true`).

## Hooks & API

No hook — this component is self-contained state, calling its one API function directly.
See [../api.md](../api.md) for the full client/server API map.

## Calls

| Action | Via | Backend endpoint |
|---|---|---|
| Submit email | `requestPasswordResetServer()` (direct import, no hook) | [Request a password reset](../../../backend/identity-access/auth/endpoints.md#request-a-password-reset) |

```
ForgotPasswordContent
  → requestPasswordResetServer()           — src/api/server/auth/request-password-reset.ts
    → backend: POST /api/auth/request-password-reset (BFF) → GraphQL `requestPasswordReset` mutation
```

## Known issues

- **`src/views/auth/` is not dead code.** Its one file is this page's real implementation, just
  organized outside the `features/auth/ui/` pattern every other page in this vertical follows. Not a
  bug — but worth knowing before assuming that folder is safe to delete or ignore. Filed in
  [`issues.md`](../../../issues.md).
