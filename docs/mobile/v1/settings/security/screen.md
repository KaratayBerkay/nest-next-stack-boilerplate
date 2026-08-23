# Security (screen)

**Route:** `/v1/:lang/settings/security` (GoRouter name `v1SettingsSecurity`)
**Router registration:** [`router.dart#L405-411`](../../../../../flutter-boilerplate/lib/app/router.dart) —
`builder: (_, state) => SecurityPageContent(lang: state.pathParameters['lang'] ?? 'en')`.
**Entry widget:** `SecurityPageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/security/page_view.dart) — **note the
source path**: `lib/views/security/`, a sibling of `lib/views/settings/`, not nested inside it. This is
a Dart-file-organization quirk only; the route, the shared `SettingsShellScaffold` chrome, and
`SettingsNav`'s own tab list all place this screen exactly where web places its equivalent. See
[settings/README.md](../README.md#-correction-to-this-runs-own-scoping-brief) for the full correction
and why this doc's own folder path (`docs/mobile/v1/settings/security/`, not `docs/mobile/security/`)
follows the verified route rather than the source folder.
**Web equivalent:** [settings/security page](../../../../frontend/v1/settings/security/page.md)

## What renders here

`ConsumerWidget`, no tier branch, wrapped in `SettingsShellScaffold` like every other settings
sub-screen. A single `Card` containing three (conditionally four) `ListTile`/`SwitchListTile` rows:

```
SecurityPageContent
├─ _MfaTile                     (SwitchListTile — MFA on/off)
├─ _BiometricTile               (SwitchListTile — only if biometricAvailableProvider is true)
├─ ListTile → push ChangePasswordPageContent
└─ ListTile → context.go('/v1/$lang/settings/sessions')
```

`_MfaTile` and `_BiometricTile` are private widget classes defined in this same file — small enough
(one `SwitchListTile` each) that they don't warrant separate widget docs, unlike `ChangePasswordPageContent`
and `MfaEnrollPageContent` below, which are full pushed sub-screens.

## `_MfaTile` and the enroll/disable split

- **Enabling** (`value: false → true`) pushes `MfaEnrollPageContent` via `Navigator.push` (not
  `context.go` — this is a modal-style push, not a GoRouter-registered route of its own) and awaits its
  result.
- **Disabling** (`value: true → false`) opens an inline `AlertDialog` with a 6-digit code field, then —
  on confirm — calls `loginActionsProvider.disableMfa(code)` directly, no separate pushed screen. This
  is the one MFA action that doesn't get its own sub-screen file (contrast with web, where
  `SecurityMfaStatus`'s disable confirmation is also inline, so the two platforms actually agree here).

## `_BiometricTile` — mobile-only, no backend call

Toggles local biometric-unlock (`biometricEnabledProvider`, backed by
[`lib/biometric_auth.dart`](../../../../../flutter-boilerplate/lib/lib/biometric_auth.dart)) —
confirmed by grep that neither this file nor `hooks/use_biometric.dart` makes any `Dio`/GraphQL call.
Purely local device authentication gating app access; no web counterpart, and not part of any of this
run's six backend modules. See
[web page.md § Mobile-only addition](../../../../frontend/v1/settings/security/page.md#mobile-only-addition-not-a-web-gap).

## Widgets

2 significant sub-screens (pushed via `Navigator`, not GoRouter routes of their own) in
[`lib/views/security/`](../../../../../flutter-boilerplate/lib/views/security/):

[change-password.md](./widgets/change-password.md) · [mfa-enroll.md](./widgets/mfa-enroll.md)

A third file in this same source tree,
[`csp/nonce_panel.dart`](../../../../../flutter-boilerplate/lib/views/security/csp/nonce_panel.dart),
is **confirmed dead code** (CSP nonces are a web-only concept — see
[MOB-001](../../../../issues.md#mob-001), already logged; not documented here as a real screen, per this
run's brief).

## API

[api.md](./api.md) — MFA operations are direct GraphQL, same shape as web's split: 3 of `mfa.dart`'s 5
exports belong to this screen, 2 belong to the login MFA challenge.
