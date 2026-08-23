# Undo password change (screen)

**Route:** `/auth/undo-password-change?token=` (GoRouter name `undoPasswordChange`)
**Router registration:** [`router.dart#L270-L276`](../../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `UndoPasswordChangePageContent` in
[`page_content.dart`](../../../../flutter-boilerplate/lib/views/auth/undo_password_change/page_content.dart)
**Web equivalent:** [undo-password-change page](../../../frontend/auth/undo-password-change/page.md)

## What renders here

One `ConsumerStatefulWidget`/`State`. No `token` → static "token missing" message. Otherwise a
description + a `ButtonVariant.danger` "confirm" button (`_buildConfirm`) — requires an explicit tap,
same as web's `variant="destructive"` button; does **not** auto-fire on mount. On success, a 2-second
`Timer` redirects to `/auth/login`.

Where the token comes from: the (out-of-scope) `settings/security`-equivalent change-password flow —
see [backend endpoints.md § Change password](../../../backend/identity-access/auth/endpoints.md#change-password).
No mobile screen for triggering the change itself was located in this pass (`ChangePasswordServer.call()`
exists in [`change_password.dart`](../../../../flutter-boilerplate/lib/api/server/auth/change_password.dart)
but its caller wasn't tracked down — out of scope).

## Calls

| Action | Via | Backend endpoint |
|---|---|---|
| Confirm undo | `loginActionsProvider.undoPasswordChange()` | [Undo a password change](../../../backend/identity-access/auth/endpoints.md#undo-a-password-change) |

Note: on the client, this and `changePassword` share one server class
(`ChangePasswordServer`, see [api.md § Shape per file](../api.md#shape-per-file)) — `undoPasswordChange`
is a second method on the same class, not a separate file, unlike web's split into
`change-password.ts`/`undo-password-change.ts`.

## Known issues

None specific to this screen found in this pass.
