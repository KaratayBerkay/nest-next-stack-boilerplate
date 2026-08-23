# SecurityChangePassword

**Source:** [`SecurityChangePassword.tsx`](../../../../../../next-js-boilerplate/src/views/settings/security/SecurityChangePassword.tsx)
**Types:** [`SecurityPageContent-types.ts`](../../../../../../next-js-boilerplate/src/types/views/settings/SecurityPageContent-types.ts)
**Used in:** [security page](../page.md)
**Mobile equivalent:** [ChangePasswordPageContent](../../../../../mobile/v1/settings/security/widgets/change-password.md)
(a pushed sub-screen on mobile, not an inline form — see that doc's note on the shape difference)

## Purpose

Self-contained current/new/confirm password form. Client component (`"use client"`), always rendered
(unlike `SecurityMfaStatus`/`SecurityMfaWizard`, which are mutually exclusive).

## Props (`SecurityChangePasswordProps`)

| Prop | Purpose |
|---|---|
| `t` | the `settings` i18n message bundle, passed down rather than called via `useMessages` internally — this component also independently calls `useMessages("auth")` itself for password-validation copy (`tAuth`), so it draws from two message namespaces at once |

## Behavior notes

- Validates client-side via `changePasswordFormSchema` (Zod,
  [`validators/auth/schema.ts`](../../../../../../next-js-boilerplate/src/validators/auth/schema.ts))
  before submitting — current-password-required, new-password min/max length + character-class rules,
  confirm-must-match. Field-level errors are rendered inline, not just a toast.
- Renders live password-complexity feedback via the shared
  [`PasswordRequirements`](../../../../../../next-js-boilerplate/src/features/auth/ui/PasswordRequirements.tsx)
  component as the user types the new password — the same live-checklist component used on the
  register/reset-password auth pages (documented there, Phase 1a, same run — not duplicated here).
- On success: clears all three fields and shows a success toast. On failure: reads
  `err.exception?.msg` for a server-provided message, falling back to a generic
  `securityChangePasswordFailed` string.

## Calls

`useAuthActions().changePassword(currentPassword, newPassword)` —
[`api/client/auth/actions.ts`](../../../../../../next-js-boilerplate/src/api/client/auth/actions.ts) →
[`api/server/auth/change-password.ts`](../../../../../../next-js-boilerplate/src/api/server/auth/change-password.ts)
→ backend [`changePassword`](../../../../../backend/identity-access/auth/endpoints.md#change-password).
This is [identity-access/auth](../../../../../backend/identity-access/auth/README.md)'s endpoint, not
this run's scope — see [api.md § Change password](../api.md#change-password--out-of-scope-linked-only) for
the exact call chain this doc verified, without re-documenting the backend side.
