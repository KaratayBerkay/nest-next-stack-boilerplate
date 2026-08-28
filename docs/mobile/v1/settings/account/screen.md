# Account (screen)

**Route:** `/v1/:lang/settings/account` (GoRouter name `v1SettingsAccount`)
**Router registration:** [`router.dart#L363-369`](../../../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `SettingsAccountPageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/settings/account/page_view.dart),
wrapped in the shared `SettingsShellScaffold` ([settings/README.md](../README.md)).
**Web equivalent:** [settings/account page](../../../../frontend/v1/settings/account/page.md)

## What renders here

No `TierGate` — every tier sees the same screen (matching web). `SettingsAccountPageContent` is a
thin `ConsumerWidget` wrapper: fetches `_profileProvider` (a bare `FutureProvider` around
`profileGetServerProvider.call()`), and on success hands off to `_AccountForm`, a `StatefulWidget`
owning the real form state directly (`TextEditingController`s for name/bio/username, a 300ms-debounced
username-availability check, avatar upload state) — no separate hook/provider layer, same "state
lives directly in the page widget" pattern web's [account/page.md](../../../../frontend/v1/settings/account/page.md)
uses.

Avatar section: [`FilePicker.pickFiles(type: FileType.image)`](https://pub.dev/packages/file_picker) →
client-side validation (≤5MB; extension allow-list jpg/jpeg/png/webp/gif) → upload → `updateProfile
(avatarUrl:)` → invalidate `_profileProvider` → best-effort re-sync of the session-wide `currentUserProvider`
via a direct `meServerProvider` call (`me.dart`, backend
[Get the current session user](../../../../backend/identity-access/auth/endpoints.md#get-the-current-session-user)
— wrapped in its own try/catch, a failure here is explicitly treated as non-fatal, since the page's
own refetch above already reflects the change). Save button: diffs each field against the loaded
profile and only sends changed keys to `updateProfile`.

`account_avatar_section.dart`'s `AccountAvatarSection` widget is **not used by this screen** — see
[Known issues](#known-issues). The avatar section above is implemented inline in `page_view.dart`
instead (a `Stack` with a camera-icon overlay button, not the separate widget's ghost-button-below
layout).

## Known issues

- [MOB-006](../../../../issues.md#mob-006) —
  `account_avatar_section.dart`'s `AccountAvatarSection` widget — **resolved by deletion** (commit
  `b98fac8a`) — was fully built and never imported anywhere (`grep -rln
  "AccountAvatarSection" flutter-boilerplate/lib` returns only its own definition file) — the real
  screen reimplements the same avatar-preview-plus-change-button UI inline instead. Same
  "scaffolded then inlined, original left behind" shape as
  [CROSS-013](../../../../issues.md#cross-013)/[FE-007](../../../../issues.md#fe-007) — see that
  issue's Notes for the sibling instance in [general](../general/screen.md#known-issues), and the two
  Phase 1b instances (web's `mfa-handlers.ts`, mobile's api-keys widget trio) this now makes a
  four-vertical recurring pattern.
