# Undo password change (page)

**Route:** `/auth/undo-password-change?token=` · **Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/auth/undo-password-change/page.tsx)
**Layout:** shared [`app/auth/layout.tsx`](../../../../next-js-boilerplate/src/app/auth/layout.tsx)
**Mobile equivalent:** [undo-password-change screen](../../../mobile/auth/undo-password-change/screen.md)

## What renders here

Server component — reads `?token=` from `searchParams`, passes it to `UndoPasswordChangeForm`
([`undo-password-change-form.tsx`](../../../../next-js-boilerplate/src/features/auth/ui/undo-password-change-form.tsx)).
No `?token=` → the form renders a "token missing" message.

Where this token comes from: the (out-of-scope) `settings/security` page's change-password action
emails a link to exactly this URL, carrying a `PASSWORD_CHANGE_UNDO` token that parks the *previous*
password hash — see [backend endpoints.md § Change password](../../../backend/identity-access/auth/endpoints.md#change-password).
This page is the only in-scope consumer of that mechanism; the trigger itself is out of scope.

Folded into this page doc, not a separate component file.

## Behavior notes

- **Requires an explicit click, unlike [verify-email](../verify-email/page.md)'s token mode.**
  `UndoPasswordChangeForm` shows the description + a `variant="destructive"` "Undo password change"
  button and waits for a click — it does **not** auto-fire on mount the way `VerifyEmailForm`'s token
  path does. Consistent with this being a destructive, security-relevant action (reverting to a
  previous password) rather than a benign confirmation.
- On success, waits 2 seconds before redirecting to `/auth/login`, same pattern as
  [reset-password](../reset-password/page.md).

## Hooks & API

No hook — calls its one API function directly. See [../api.md](../api.md).

## Calls

| Action | Via | Backend endpoint |
|---|---|---|
| Confirm undo | `undoPasswordChangeServer(token)` (direct import) | [Undo a password change](../../../backend/identity-access/auth/endpoints.md#undo-a-password-change) |

```
UndoPasswordChangeForm
  → undoPasswordChangeServer()             — src/api/server/auth/undo-password-change.ts
    → backend: POST /api/auth/undo-password-change (BFF) → GraphQL `undoPasswordChange` mutation
```

## Known issues affecting this page

None specific to this page found in this pass.
