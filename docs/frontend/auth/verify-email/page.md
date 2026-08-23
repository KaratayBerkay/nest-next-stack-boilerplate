# Verify email (page)

**Route:** `/auth/verify-email?token=` or `?userId=&email=` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/auth/verify-email/page.tsx)
**Layout:** shared [`app/auth/layout.tsx`](../../../../next-js-boilerplate/src/app/auth/layout.tsx)
**Mobile equivalent:** [verify-email screen](../../../mobile/auth/verify-email/screen.md)

## What renders here

Server component — reads `token`, `userId`, `email` from `searchParams`, passes all three to
`VerifyEmailForm` ([`verify-email-form.tsx`](../../../../next-js-boilerplate/src/features/auth/ui/verify-email-form.tsx)),
which is **one component covering two entirely different flows** depending on which params are
present:

| Params present | Mode | Behavior |
|---|---|---|
| `token` | Token mode | Auto-verifies on mount (`useEffect`), no user interaction needed |
| `userId` + `email` (no `token`) | Code mode | Renders a 6-digit `InputOTP` + resend link; user must type the code emailed/sent via OTP |
| neither | — | "token missing" error state |

Token mode is how a user arrives by clicking the emailed verification link; code mode is how they
arrive from [register](../register/page.md)'s post-submit redirect
(`/auth/verify-email?userId={id}&email={email}`) — registration itself already sent both a token
email *and* generated an OTP code (see
[backend endpoints.md § Register](../../../backend/identity-access/auth/endpoints.md#register)), so
either completing path works independently.

Folded into this page doc, not a separate component file.

## Hooks & API

No hook — calls its API functions directly. See [../api.md](../api.md).

## Calls

| Action | Mode | Via | Backend endpoint |
|---|---|---|---|
| Auto-verify on mount | token | `verifyEmailServer(token)` | [Verify email](../../../backend/identity-access/auth/endpoints.md#verify-email) |
| Submit 6-digit code | code | `verifyEmailCodeServer(userId, code)` | [Verify email with a code](../../../backend/identity-access/auth/endpoints.md#verify-email-with-a-code) |
| Resend code | code | `resendEmailCodeServer(userId, email)` | [Resend the email verification code](../../../backend/identity-access/auth/endpoints.md#resend-the-email-verification-code) |

All three come from one file,
[`api/server/auth/verify-email.ts`](../../../../next-js-boilerplate/src/api/server/auth/verify-email.ts).

## Known issues affecting this page

None specific to this page found in this pass.
