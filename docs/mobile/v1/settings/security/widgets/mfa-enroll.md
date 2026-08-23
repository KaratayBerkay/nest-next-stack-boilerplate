# MfaEnrollPageContent (widget)

**Source:** [`mfa_enroll/page_content.dart`](../../../../../../flutter-boilerplate/lib/views/security/mfa_enroll/page_content.dart)
**Used in:** [security screen](../screen.md) — pushed via `Navigator.push<bool>`, awaited by `_MfaTile`
**Web equivalent:** [SecurityMfaWizard component](../../../../../frontend/v1/settings/security/components/security-mfa-wizard.md)
(same 3-step flow, inline on web vs. a pushed screen here)

## Purpose

`ConsumerStatefulWidget`, the full 3-step TOTP enrollment wizard as one pushed `Scaffold`, internal
`_EnrollStep` enum (`qrCode | verify | backupCodes`) driving which body renders — structurally the
same one-widget-three-steps shape as web's `SecurityMfaWizard`, just as a separate screen instead of an
inline section.

## Constructor

```dart
class MfaEnrollPageContent extends ConsumerStatefulWidget {
  const MfaEnrollPageContent({super.key});
}
```

Calls `enrollMfa()` itself in `initState()` — enrollment starts automatically on push, there's no
separate "start enrollment" button the way the screen that pushes this one might imply; by the time
this widget is on screen, the QR code is already being fetched.

## Behavior notes vs. web

- **Step 1 (QR)**: `qr_flutter`'s `QrImageView` instead of web's `qrcode.react`'s `QRCodeSVG` — visual
  parity, different package, same `otpauthUrl` data.
- **Step 3 (backup codes)**: has a feature web's wizard does not — an **export/share** button
  (`_exportBackupCodes`, writes the codes to a temp file and invokes the OS share sheet via
  `share_plus`), in addition to the plain on-screen list. A genuine mobile-only affordance (makes sense
  given mobile's easier access to native share/save flows than a browser tab) — not a parity gap in
  either direction, just a platform-appropriate addition. Failure here is deliberately **not** routed
  through the shared `_error` field — the widget's own comment explains why: setting `_error` would
  trip `build()`'s top-level error branch and blank out the still-visible backup codes on this final
  step, so a `SnackBar` is used instead.
- `_confirmComplete()` (the final "Done" action) updates the local `currentUserProvider`'s
  `mfaEnabled` flag directly via `authProvider.notifier.updateUser(...)` before popping — client-side
  cache update, not a re-fetch of the user; same optimistic-update shape web's `PageContent` uses
  (`setMfaEnabled(true)` inline) via a different mechanism (Riverpod provider mutation vs. React
  `useState`).

## Calls

- Step 1 (on `initState`): `ref.read(loginActionsProvider).enrollMfa()` — backend
  [Enroll in MFA](../../../../../backend/identity-access/mfa/endpoints.md#enroll-in-mfa).
- Step 2 (`_verifyCode`): `ref.read(loginActionsProvider).verifyMfa(code)` — backend
  [Verify MFA enrollment](../../../../../backend/identity-access/mfa/endpoints.md#verify-mfa-enrollment).
- Step 3: no network call — `_confirmComplete()` only updates local state, `_exportBackupCodes()` is a
  local file write + OS share sheet, no backend involvement.

Both calls are direct GraphQL, no BFF — see [api.md § Shape](../api.md#shape).
