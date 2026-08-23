# Privacy (screen)

**Route:** `/v1/:lang/settings/privacy` (GoRouter name `v1SettingsPrivacy`)
**Router registration:** [`router.dart#L384-390`](../../../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `SettingsPrivacyPageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/settings/privacy/page_view.dart)
**Web equivalent:** [settings/privacy page](../../../../frontend/v1/settings/privacy/page.md)

## What renders here

`TierGate` wraps the same `_PrivacySettings` widget for all four tiers. Two
[`PrivacyToggleRow`](../../../../../flutter-boilerplate/lib/views/settings/privacy/privacy_toggle_row.dart)
rows (hide profile picture / use a chat nickname, the latter revealing a text field when on) plus a
Save button and a link to [settings/sessions](../sessions/screen.md). `PrivacyToggleRow` itself is a
real, used widget (unlike [account](../account/screen.md)'s/[general](../general/screen.md)'s dead
scaffold siblings) — confirmed via `grep -rln "PrivacyToggleRow("
flutter-boilerplate/lib` → this file plus its own definition, nothing orphaned here.

## State-sync design, matching web's

Seeds `hideProfilePicture`/`useNickname` from `initState()`'s `currentUserProvider` snapshot, then
re-syncs both plus the nickname text field from the richer `userProfileProvider` once it resolves — a
one-shot sync (`_loadedPrivacyDefaults` guard) rather than continuous, specifically so a later refetch
triggered by another settings screen's save can't clobber an in-progress edit here. The inline comment
on this pattern explains the reasoning directly. `_save()` always sends `chatNickname` (mapped from the
text field), `useNickname`, and `hideAvatar` together — toggling `useNickname` off does not clear a
previously-saved nickname unless the text field itself is also cleared, matching web's preserve-on-
disable contract (see
[profile backend endpoints.md](../../../../backend/social-content/profile/endpoints.md#update-profile)).
A hide-avatar-toggle-is-inert / nickname-toggle-destroys-data bug shaped exactly like this was fixed
in this file previously — confirmed by reading the current source directly rather than assuming: the
preserve-on-disable logic and the three-way `seededX` render-time re-sync described above are both
present and correct as of this read, not something this doc is taking on faith.

## Known issues

None specific to this screen — the dead-widget pattern found in
[account](../account/screen.md#known-issues) and [general](../general/screen.md#known-issues) does not
repeat here.
