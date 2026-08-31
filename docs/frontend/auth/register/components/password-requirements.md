# PasswordRequirements

**Source:** [`PasswordRequirements.tsx`](../../../../../next-js-boilerplate/src/features/auth/ui/PasswordRequirements.tsx)
**Types:** [`PasswordRequirements-types.ts`](../../../../../next-js-boilerplate/src/types/auth/PasswordRequirements-types.ts)
**Used in:** [register page](../page.md) **and** [reset-password page](../../reset-password/page.md)
**Mobile equivalent:** none — see Known issues

## Purpose

A live checklist rendered next to a password `Input`, ticking each rule green
(`IconCheck`)/red (`IconX`) as the user types: length (8-128), lowercase, uppercase, number. Client
component (`"use client"`), added in the same change that put a show/hide reveal icon on every
password input app-wide (see [git history note](#history) below).

## Props (`PasswordRequirementsProps`)

| Prop | Purpose |
|---|---|
| `password` | the current (uncommitted) input value — re-evaluated on every keystroke |

## Rule source

Both the checklist and the Zod submit-time validation
([`validators/auth/schema.ts`](../../../../../next-js-boilerplate/src/validators/auth/schema.ts))
read from one shared table,
[`passwordRuleChecks`/`passwordRuleOrder`](../../../../../next-js-boilerplate/src/validators/auth/password-policy.ts) —
so the displayed rules can't drift from what actually blocks submission. The backend mirrors the same
four checks via `PASSWORD_COMPLEXITY_REGEX`
([`password-policy.ts`](../../../../../nest-js-boilerplate/src/auth/password-policy.ts)) plus its own
independent `MinLength(8)`/`MaxLength(128)` DTO decorators — see
[backend README.md](../../../../backend/identity-access/auth/README.md#registration-login-and-password-flows)
for the redundant-checks note this feeds into.

## History

Added 2026-08-20 (commit `d4fee7ce`, "reveal-icon on all password inputs + live complexity
checklist") alongside a reveal/hide toggle on the shared `Input` component
([`components/ui/input/input.tsx`](../../../../../next-js-boilerplate/src/components/ui/input/input.tsx)) —
every password field app-wide gets the toggle automatically from that shared component change, but
this checklist widget itself is opt-in per form (only wired into
[`register-form.tsx`](../../../../../next-js-boilerplate/src/features/auth/ui/register-form.tsx) and
[`reset-password-form.tsx`](../../../../../next-js-boilerplate/src/features/auth/ui/reset-password-form.tsx)
— **not** [`undo-password-change-form.tsx`](../../undo-password-change/page.md), which has no
password field, and not the out-of-scope `settings/security` change-password form, which wasn't
checked in this pass).

## Known issues

- ⚠ **No Flutter equivalent at all.** This commit touched only `next-js-boilerplate` and
  `nest-js-boilerplate` (confirmed via `git show d4fee7ce --stat` — zero `flutter-boilerplate` files).
  Mobile's [register](../../../../mobile/auth/register/screen.md) and
  [reset-password](../../../../mobile/auth/reset-password/screen.md) screens have neither a live
  requirements checklist nor a password show/hide toggle (`LabeledField`'s `obscureText` is a fixed
  bool with no visible-toggle affordance). Filed as `CROSS-011` (resolved).

## Calls

None — pure presentational, reads only its `password` prop.
