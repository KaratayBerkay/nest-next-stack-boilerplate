# LoginCredentialsForm

**Source:** [`LoginCredentialsForm.tsx`](../../../../../next-js-boilerplate/src/features/auth/ui/LoginCredentialsForm.tsx)
**Used in:** [login page](../page.md), rendered by `LoginForm` when there's no active MFA challenge
**Mobile equivalent:** [login screen](../../../../mobile/auth/login/screen.md)'s `_buildForm` (folded
into the same screen file, not a separate widget — see that doc)

## Purpose

The actual email/password form. Client component (`"use client"`).

## Props (`LoginCredentialsFormProps`)

| Prop | Purpose |
|---|---|
| `login` | passed down from `useAuth()` by the parent `LoginForm` |
| `onMfaRequired` | setter for `LoginForm`'s `mfaState` — see below |

## Behavior notes

- **Validation** is [`loginFormSchema`](../../../../../next-js-boilerplate/src/validators/auth/schema.ts)
  (Zod): non-empty email in valid-email shape, password 8-128 chars. This is a **weaker** check than
  registration's — no complexity requirement, since an existing password only needs to be typed
  correctly, not re-validated against the current policy.
- **Post-login redirect reads a cookie, not `useRouter`'s locale.** `getPostLoginLang()` reads the
  `LANG_COOKIE` value directly (falling back to `DEFAULT_LANG`) to build the `/v1/{lang}/feed`
  destination — this page renders outside the `/v1/[lang]/` route tree entirely (see
  [README.md](../../README.md)), so there's no `params.lang` to read from routing context.
- **MFA branch detection is a duck-typed error shape, not a distinct return value.** `login()` (from
  [hooks.md](../../hooks.md)) throws on the MFA-required case too — the caller distinguishes it by
  checking `err.mfaRequired === true` (set explicitly by
  [`login.ts`](../../api.md)'s error path) and, if so, calls `onMfaRequired(...)` instead of setting a
  field error. Every other thrown shape either carries `{field, msg}` (mapped to one input's error
  text) or falls back to a generic `t.errors.loginFailed` form-level error.
- Uses shared UI primitives: `Input`, `Label`, `Button` (all `components/ui/`) — not documented here,
  see [ui-components skill/conventions] if changing them.

## Calls

`login` is a prop, not called directly by this component's own imports — resolves to:

```
LoginCredentialsForm (login prop)
  → useAuth().login()                      — src/features/auth/hooks/useAuth.tsx
    → loginServer()                        — src/api/server/auth/login.ts
      → backend: POST /api/auth/login (BFF) → GraphQL `login` mutation
```

- Hook: [hooks.md](../../hooks.md)
- Frontend BFF route: [api.md](../../api.md)
- Backend endpoint: [Log in](../../../../backend/identity-access/auth/endpoints.md#log-in)
