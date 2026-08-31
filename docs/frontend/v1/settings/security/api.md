# Security — API

Page: [page.md](./page.md) · Server (BFF):
[`src/api/server/auth/mfa.ts`](../../../../../next-js-boilerplate/src/api/server/auth/mfa.ts)

**Folder-naming note**: this page's entire API surface lives in a file under `api/server/auth/`, not
`api/server/security/` or `api/server/mfa/` — the frontend organizes `api/server/**` by which backend
*module* a call reaches, and the backend's MFA operations are exposed under an `/api/auth/mfa/*` BFF
URL namespace (see `constants/api/urls.ts`'s `AUTH_MFA_*` constants). Same pattern as
[devices](../../../../backend/identity-access/devices/README.md)'s handshake BFF route living under
`api/server/auth/device-handshake.ts`, and
[sessions](../../../../backend/identity-access/sessions/README.md)'s `trust-device.ts` BFF route
living under the `/api/auth/trust-device` path.

## One file, two owners

`mfa.ts` exports 5 functions. Only 3 belong to this page — the other 2 back the **login-time** MFA
challenge ([identity-access/auth](../../../../backend/identity-access/auth/README.md)'s territory,
not detailed here):

| Export | BFF route | Backend call | Owner |
|---|---|---|---|
| `enrollMfaServer()` | `POST /api/auth/mfa/enroll` | [mfa/endpoints.md#enroll-in-mfa](../../../../backend/identity-access/mfa/endpoints.md#enroll-in-mfa) | **this page** |
| `verifyMfaEnrollmentServer(code)` | `POST /api/auth/mfa/verify` | [mfa/endpoints.md#verify-mfa-enrollment](../../../../backend/identity-access/mfa/endpoints.md#verify-mfa-enrollment) | **this page** |
| `disableMfaServer(code)` | `POST /api/auth/mfa/disable` | [mfa/endpoints.md#disable-mfa](../../../../backend/identity-access/mfa/endpoints.md#disable-mfa) | **this page** |
| `verifyMfaServer(mfaToken, code)` | `POST /api/auth/login/mfa` (`AUTH_LOGIN_MFA_URL`) | `auth.resolver.ts`'s `verifyLoginMfa` — a **different** mutation from this module's `verifyMfa` | login MFA challenge, not this page |
| `resendLoginCodeServer(mfaToken)` | `POST /api/auth/login/mfa/resend` (`AUTH_LOGIN_MFA_RESEND_URL`) | `auth.resolver.ts`'s `resendLoginCode` | login MFA challenge, not this page |

All 3 of this page's routes follow the same shape, confirmed by reading each `route.ts` directly (not
inferred): cookie → `graphqlFetch` → the matching backend mutation, response passed through as-is.
Example — `app/api/auth/mfa/enroll/route.ts` reads the `access_token` cookie, POSTs
`mutation EnrollMfa { enrollMfa { otpauthUrl secret } }` via `graphqlFetch`, and returns
`data.enrollMfa` directly. None of the three echo a CSRF header — MFA management mutations aren't on
[csrf](../../../../backend/identity-access/csrf/README.md)'s `CsrfGuard`-protected surface (that's
`refresh`/`logout` only), just the general `SessionAuthGuard` cookie-mutation CSRF check.

## Change password — out of scope, linked only

`SecurityChangePassword`'s submit action calls `useAuthActions().changePassword(currentPassword,
newPassword)` — [`api/client/auth/actions.ts`](../../../../../next-js-boilerplate/src/api/client/auth/actions.ts),
which resolves to
[`api/server/auth/change-password.ts`](../../../../../next-js-boilerplate/src/api/server/auth/change-password.ts)
(`POST /api/auth/change-password`, `AUTH_CHANGE_PASSWORD_URL`) → backend
[`changePassword`](../../../../backend/identity-access/auth/endpoints.md#change-password). This is
[identity-access/auth](../../../../backend/identity-access/auth/README.md)'s module, not this run's —
linked here as the exact call site this page depends on, not independently re-verified or detailed.

## Known issues

- `FE-007` — **resolved by deletion**: a sibling file,
  `views/settings/security/mfa-handlers.ts`, exported its own
  `handleEnroll`/`handleVerify`/`handleDisable` built on the same `mfa.ts` functions but was never
  imported anywhere. The dedup pass (commit `aa04a418`) deleted it. Originally flagged as fully dead, functionally
  redundant with the real, inline handlers in `PageContent.tsx`.
