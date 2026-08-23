# ChangePasswordPageContent (widget)

**Source:** [`change_password/page_content.dart`](../../../../../../flutter-boilerplate/lib/views/security/change_password/page_content.dart)
**Used in:** [security screen](../screen.md) — pushed via `Navigator.push(MaterialPageRoute(builder:
(_) => const ChangePasswordPageContent()))`, not a GoRouter-registered route
**Web equivalent:** [SecurityChangePassword component](../../../../../frontend/v1/settings/security/components/security-change-password.md)
(there, an inline form; here, a full pushed `Scaffold`)

## Purpose

`ConsumerStatefulWidget`, a full-screen form (own `AppBar`) for changing the account password:
current/new/confirm fields, client-side validation, submit, and a distinct "done" success state that
replaces the form in place rather than popping automatically.

## Constructor

```dart
class ChangePasswordPageContent extends ConsumerStatefulWidget {
  const ChangePasswordPageContent({super.key});
}
```

No parameters — reads everything it needs from `ref` and its own local `TextEditingController`s.

## Behavior notes vs. web

- **Shape difference, not just a styling one**: web's `SecurityChangePassword` is an always-visible
  inline section on the security page itself; this widget is a separate pushed screen reached by
  tapping a `ListTile`. Same backend call, different information architecture — worth knowing before
  assuming the two are structurally interchangeable for a future parity pass.
- Client-side validation is hand-rolled (`_validate()`, a sequence of `if` checks setting `_error`)
  rather than a schema library — web uses `changePasswordFormSchema` (Zod). Checks the same basic
  rules (required, min length 8, must-match) but not the character-class requirements
  (uppercase/lowercase/number) web's `PasswordRequirements` live-checklist enforces visually — this
  widget has no equivalent live-feedback component at all, just a single error string shown after
  submit fails.
- On success, replaces the whole body with a checkmark + "Done" button (`_buildDone`) rather than
  toasting and clearing fields in place — web clears the form and shows a toast, staying on the same
  page; this widget's user has to explicitly navigate back.

## Calls

`ref.read(loginActionsProvider).changePassword(current, new)` — direct GraphQL, no BFF (mobile has
none). See [api.md § Change password](../api.md#change-password--out-of-scope-linked-only) for the
exact call chain (out of this run's scope to verify further —
[identity-access/auth](../../../../../backend/identity-access/auth/README.md)'s territory).
