# Register (page)

**Route:** `/auth/register` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/auth/register/page.tsx)
**Layout:** shared [`app/auth/layout.tsx`](../../../../next-js-boilerplate/src/app/auth/layout.tsx)
**Mobile equivalent:** [register screen](../../../mobile/auth/register/screen.md)

## What renders here

Server component, no session check (unlike [login](../login/page.md), this page doesn't redirect an
already-signed-in visitor away — it renders `RegisterForm` regardless, which itself shows a
"signed in as" message via `useAuth()` if a session exists client-side).

```
RegisterPage
├─ RegisterForm         (Suspense: PulseBlockFallback)
└─ SocialLoginButtons   (Suspense: PulseSmallBlockFallback)
```

`RegisterForm` ([`register-form.tsx`](../../../../next-js-boilerplate/src/features/auth/ui/register-form.tsx))
is folded into this page doc rather than given its own file — unlike [login](../login/page.md), it
has no distinct sub-states worth splitting out (no MFA-equivalent branch); it's one form: name
(optional), email, password, submit.

## Components

Only one significant, page-local component:

- [password-requirements.md](./components/password-requirements.md) — the live requirements
  checklist next to the password field; documented here since register is where it's first
  introduced, also used by [reset-password](../reset-password/page.md)

Also renders [`SocialLoginButtons`](../login/components/social-login-buttons.md) (shared, documented
under login).

## Hooks & API

- [../hooks.md](../hooks.md) — `useAuth().register()` drives this page
- [../api.md](../api.md) — full client/server API map

## Calls

| Action | Via | Backend endpoint |
|---|---|---|
| Submit the form | `useAuth().register()` → [`register.ts`](../api.md) | [Register](../../../backend/identity-access/auth/endpoints.md#register) |
| Continue with a social provider | full-page navigation — see [social-login-buttons.md](../login/components/social-login-buttons.md) | [Log in with OAuth](../../../backend/identity-access/auth/endpoints.md#log-in-with-oauth) |

On success, navigates to `/auth/verify-email?userId={id}&email={email}` — registration itself already
issued a full session (see [backend README.md § Registration, login, and password flows](../../../backend/identity-access/auth/README.md#registration-login-and-password-flows)),
so this redirect is purely to prompt verification, not to gate access to the app.

## Known issues affecting this page

- Password validation runs client-side ([Zod schema](../../../../next-js-boilerplate/src/validators/auth/schema.ts))
  and server-side (DTO class-validator decorators) with matching rules — no drift found here. See the
  backend's own [known issue](../../../backend/identity-access/auth/endpoints.md#known-issues) about a
  *third*, redundant server-side check that's dead code as a result, not user-visible from this page.
