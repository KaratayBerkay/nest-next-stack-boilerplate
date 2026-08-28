# General (screen)

**Route:** `/v1/:lang/settings/general` (GoRouter name `v1SettingsGeneral`)
**Router registration:** [`router.dart#L377-383`](../../../../../flutter-boilerplate/lib/app/router.dart)
**Entry widget:** `SettingsGeneralPageContent` in
[`page_view.dart`](../../../../../flutter-boilerplate/lib/views/settings/general/page_view.dart)
**Web equivalent:** [settings/general page](../../../../frontend/v1/settings/general/page.md)

## What renders here

A `TierGate` wraps `_GeneralSettings` for all four tiers identically (no real differentiation, same
as web). Four fields, staged in local `State` and only committed on Save — a theme picker (shared
component, not detailed here) sits above them in the same card:

| Field | Provider | Persisted how |
|---|---|---|
| Language | `localeProvider` | **both** `profile.updateProfile({locale})` *and* `localeProvider.notifier.setLocale()` — see below |
| Timezone | (local `State` only, seeded from `userProfileProvider`) | `profile.updateProfile({timezone})` only |
| Currency | `currencyProvider` | local device prefs (`shared_preferences`), via `currencyProvider.notifier.setCurrency()` — no backend call, same cookie-equivalent model as web |
| Date display | `dateDisplayProvider` | same, `dateDisplayProvider.notifier.setDateDisplay()` |

## Language actually changes the app's language here — unlike web

`_save()` calls `ref.read(localeProvider.notifier).setLocale(_stagedLocale)` in addition to persisting
`locale` through `profile.updateProfile`. `localeProvider`
([`hooks/use_theme.dart`](../../../../../flutter-boilerplate/lib/hooks/use_theme.dart)) is the
**same** provider the root `MaterialApp` watches directly
([`app/app.dart#L115`](../../../../../flutter-boilerplate/lib/app/app.dart)) and the same one the
dedicated chrome [`LangSwitcher`](../../../../../flutter-boilerplate/lib/components/nav/lang_switcher.dart)
writes to — confirmed via `grep -rn "localeProvider" flutter-boilerplate/lib`, both are among its only
consumers. So saving a new Language on this screen takes effect immediately, correctly. This is the
mobile side of [CROSS-019](../../../../issues.md#cross-019) — web's equivalent field does **not** do this
(see [frontend/v1/settings/general/page.md § Known issues](../../../../frontend/v1/settings/general/page.md#known-issues)).

Timezone has no equivalent live-apply mechanism on either platform — see
[Known issues](#known-issues).

## Known issues

- [CROSS-019](../../../../issues.md#cross-019) — this screen's Language field is the *correct* half of a
  cross-platform pair; web's equivalent is broken (persists but never applies). Timezone, on this
  screen and web's, persists correctly but is never read back by either app to affect actual date/time
  formatting or rendering.
- [MOB-006](../../../../issues.md#mob-006) —
  `settings_select.dart`'s `SettingsSelect` widget — **resolved by deletion** (commit `b98fac8a`) —
  was fully built and **never used** (`grep -rln "SettingsSelect("
  flutter-boilerplate/lib` returns only its own definition) — this screen uses inline `DropdownButton`s
  for every field instead. Same dead-scaffold pattern as
  [account/screen.md § Known issues](../account/screen.md#known-issues)'s `AccountAvatarSection`; web's
  own `SettingsSelect.tsx` (the component this Dart file was presumably porting) **is** actually used
  there (four times, in
  [`views/settings/general/FreePageView.tsx`](../../../../../next-js-boilerplate/src/views/settings/general/FreePageView.tsx)) —
  so this is a mobile-only regression relative to its own web counterpart, not a shared gap.
