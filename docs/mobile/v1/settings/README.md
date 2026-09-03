# Settings

**Routes:** `/v1/:lang/settings/*` (8 sub-screens, GoRouter names `v1Settings*`) · **Shared shell:**
[`settings_shell.dart`](../../../../flutter-boilerplate/lib/views/settings/settings_shell.dart) —
`SettingsShellScaffold` (side rail on wide viewports, top tab row on narrow) + `SettingsNav`, both
mirroring web's [`SettingsNav.tsx`](../../../frontend/v1/settings/README.md).
**Web equivalent:** [settings](../../../frontend/v1/settings/README.md)

## ⚠ Correction to this run's own scoping brief

This run's brief stated Security "is NOT nested under settings on mobile (unlike web) — it's its own
top-level route," based on earlier research. **Checked directly against
[`router.dart`](../../../../flutter-boilerplate/lib/app/router.dart) and
[`settings_shell.dart`](../../../../flutter-boilerplate/lib/views/settings/settings_shell.dart), this
is false.** The registered route is `path: '/v1/:lang/settings/security'` (`name: 'v1SettingsSecurity'`,
`router.dart#L406-411`), it renders inside the exact same `SettingsShellScaffold` chrome as
Sessions/API Keys, and `SettingsNav`'s own `tabs` array includes a Security entry pointing at that same
path (`settings_shell.dart#L75-80`) — identical nesting to web's `/v1/[lang]/settings/security` in
every observable way (URL, shell, nav placement). **The only thing that isn't nested is the Dart
*source file*** — `lib/views/security/page_view.dart` sits as a sibling of `lib/views/settings/`
rather than inside it (`lib/views/settings/security/`), a pure file-organization quirk with no routing
consequence. This doc's own folder placement follows the verified real route (nested, matching
[conventions.md § 1](../../../conventions.md#1-folder-structure-rule)'s "doc tree mirrors the real
route tree" rule) — `docs/mobile/v1/settings/security/`, not `docs/mobile/security/`. See this run's
final report for the corresponding correction to
[`docs/mobile/README.md`](../../../mobile/README.md)'s vertical-index table, which currently repeats
the same "top-level, not nested" claim and needs the same fix (out of this doc's own edit scope — that
file is shared-index territory).

## Sub-screens

`SettingsNav`'s `tabs` array (`settings_shell.dart#L56-105`) is the authoritative list of 8, matching
web's `SettingsNav.tsx` 1:1:

| Tab | Route | Status |
|---|---|---|
| [General](./general/screen.md) | `settings/general` | ✅ Phase 2a |
| [Account](./account/screen.md) | `settings/account` | ✅ Phase 2a |
| [Privacy](./privacy/screen.md) | `settings/privacy` | ✅ Phase 2a |
| [Security](./security/screen.md) | `settings/security` | ✅ Phase 1b — nested, see correction above |
| [Usage](./usage/screen.md) | `settings/usage` | ✅ (gap closed post-Phase 5 — fell outside both Phase 4 sub-efforts' scope and Phase 5's; written directly once found) |
| [Billing](./billing/screen.md) | `settings/billing` | ✅ Phase 4b |
| [API Keys](./api-keys/screen.md) | `settings/api-keys` | ✅ Phase 1b |
| [Sessions](./sessions/screen.md) | `settings/sessions` | ✅ Phase 1b |

The settings index itself (`/v1/:lang/settings`, no tab of its own —
[`views/settings/page_view.dart`](../../../../flutter-boilerplate/lib/views/settings/page_view.dart),
`SettingsPageContent`) renders the same plan-summary content as web's settings index page — billing
domain, not documented here, same reasoning as
[frontend/v1/settings/README.md](../../../frontend/v1/settings/README.md#the-settings-index-page-v1langsettings-no-tab-of-its-own).

## What's actually account-security (this run's scope)

| Sub-screen | Backend module(s) |
|---|---|
| [Security](./security/screen.md) | [mfa](../../../backend/identity-access/mfa/README.md) + a change-password action into [auth](../../../backend/identity-access/auth/README.md) |
| [Sessions](./sessions/screen.md) | [sessions](../../../backend/identity-access/sessions/README.md) |
| [API Keys](./api-keys/screen.md) | [api-keys](../../../backend/identity-access/api-keys/README.md) |
| [General](./general/screen.md), [Account](./account/screen.md), [Privacy](./privacy/screen.md) | [profile](../../../backend/social-content/profile/README.md) |
| [Billing](./billing/screen.md) | [billing](../../../backend/billing-usage/billing/README.md) |
| [Usage](./usage/screen.md) | [usage](../../../backend/billing-usage/usage/README.md) |

[authorization](../../../backend/identity-access/authorization/README.md) (real consumer: `/admin`,
Phase 5) and [csrf](../../../backend/identity-access/csrf/README.md) (infra, referenced from the
`auth` module's token-refresh flow on mobile — see that module's doc) have no settings sub-screen.
[devices](../../../backend/identity-access/devices/README.md) has no screen either — app-wide
auth-bootstrap dependency.

## Known issues affecting this vertical

- `CROSS-012` (resolved) — `updateApiKey` has zero UI on mobile too (not just web) —
  `grep -rn "updateApiKey" flutter-boilerplate/lib` returns nothing at all.
- `CROSS-013` (resolved) — this vertical's api-keys sub-screen has the *exact* same
  dead-parallel-implementation pattern web's security page does: 3 whole widget files
  (`api_key_list.dart`, `create_api_key_form.dart`, `api_key_handlers.dart`) are fully built and
  completely unused — the real screen (`page_content.dart`) reimplements everything inline instead.
  See [api-keys/screen.md](./api-keys/screen.md#known-issues).
- `MOB-006` (resolved) — same pattern again, twice more, in this vertical's own
  new subpages: `account_avatar_section.dart` (Account) and `settings_select.dart` (General) are
  fully-built, never-imported widgets; both real screens reimplement the same UI inline. Four
  recurrences of this exact pattern now, across api-keys/security/account/general.
- `CROSS-019` (resolved — fixed 2026-09-03: the saved timezone now drives every date formatter — web reads it from the `timezone` cookie in `lib/date-time.ts` (kept in sync by the auth provider and the settings save), Flutter via `DateTimeHelper.setPreferredTimeZone` (package `timezone`, synced from the profile)) — General's Language field is the only one of the two
  platforms where changing it actually re-renders the app in the new language; web only persists it.
  Timezone persists on both platforms but neither reads it back for real formatting.
- ⚠ `CROSS-034` (resolved) — Billing's payment-methods UI is a rare reversal
  of this vertical's usual direction: mobile has a real, working add/remove/set-default flow;
  [web's equivalent](../../../frontend/v1/settings/billing/components/payment-methods.md) is read-only.
- ⚠ `MOB-020` (resolved) — the dead-parallel-implementation pattern noted
  above recurs a fifth time in Billing: `payment_methods.dart`'s `PaymentMethods` widget class is fully
  built and never imported — the real screen reimplements the same UI inline instead. See
  [billing/screen.md](./billing/screen.md#known-issues).
