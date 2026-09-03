# General (page)

**Route:** `/v1/[lang]/settings/general` · **Source:** [`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/settings/general/page.tsx)
**Mobile equivalent:** [settings/general screen](../../../../mobile/v1/settings/general/screen.md)
**Settings index:** [../README.md](../README.md)

## What renders here

`getTierView()`, all four tiers identical (same re-export pattern as
[account](../account/page.md)). [`FreePageView.tsx`](../../../../../next-js-boilerplate/src/views/settings/general/FreePageView.tsx)
renders four selects inside a single-tab `Tabs` shell (the tab UI wraps content that never has a
second tab — worth noting only because it's a slightly unusual choice, not a bug):

| Field | Source of truth | Persisted how |
|---|---|---|
| Language | `useAuth().user.locale` | [`profile.updateProfile`](../../../../backend/social-content/profile/endpoints.md#update-profile), on Save |
| Timezone | `useAuth().user.timezone` | same, on Save |
| Currency | a cookie, read via `readCurrencyCookie()` | `document.cookie` write, **immediately** on selection — not gated behind Save |
| Date display format | a cookie, read via `readDateDisplayCookie()` | same — immediate cookie write |

**Two genuinely different persistence models on one page, and it isn't visually distinguished**:
Currency and Date display take effect the instant you pick them (`setCurrency`/`setDateDisplay` in
[`lib/settings/handlers.ts`](../../../../../next-js-boilerplate/src/lib/settings/handlers.ts) both
write `document.cookie` directly inside the `onChange` handler); Language and Timezone are staged in
local state and only sent to the backend when "Save" is pressed
(`saveSettings()`, same file, calling `updateProfile({locale, timezone})` then `refreshUser()`). A
user who changes Language, then navigates away without pressing Save, loses that specific change —
Currency/Date-display changes made in the same visit would already be applied and would survive.

## The Language field does not actually change the UI language — see Known issues

This is the headline finding on this page: selecting a different Language here saves successfully
(the `updateProfile` call and its Redis mirror both succeed) but has **no observable effect** on the
rendered UI. See [Known issues](#known-issues).

## Hooks & API

No vertical-specific `hooks.md` — state lives directly in `FreePageView`. Helper files (not hooks):
[`lib/settings/handlers.ts`](../../../../../next-js-boilerplate/src/lib/settings/handlers.ts)
(`setCurrency`/`setDateDisplay`/`saveSettings`),
[`lib/settings/cookies.ts`](../../../../../next-js-boilerplate/src/lib/settings/cookies.ts)
(`readCurrencyCookie`/`readDateDisplayCookie`),
[`lib/settings/constants.ts`](../../../../../next-js-boilerplate/src/lib/settings/constants.ts)
(`LOCALES`/`TIMEZONES`/`CURRENCY_OPTIONS` option lists). `SettingsSelect` (the repeated
label+dropdown wrapper used for all four fields) is a trivial presentational leaf, not documented as
its own component. [`useProfileActions()`](../account/api.md) is shared with
[account](../account/page.md)/[privacy](../privacy/page.md) — see [api.md](./api.md).

Cross-cutting: `useAuth`, `useToast`, `useMessages`.

- [api.md](./api.md)

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Save locale/timezone | [social-content/profile/endpoints.md#update-profile](../../../../backend/social-content/profile/endpoints.md#update-profile) |

Currency and Date display never reach the backend at all — pure client-side cookies, no endpoint.

## Known issues

- `CROSS-019` (resolved — fixed 2026-09-03: the saved timezone now drives every date formatter — web reads it from the `timezone` cookie in `lib/date-time.ts` (kept in sync by the auth provider and the settings save), Flutter via `DateTimeHelper.setPreferredTimeZone` (package `timezone`, synced from the profile)) — the Language `<select>` on this page persists
  `profile.locale` to the backend correctly, but **nothing anywhere in the web app reads `user.locale`
  back** to actually change the rendered language — the real mechanism
  ([`LangSwitcher.tsx`](../../../../../next-js-boilerplate/src/components/layout/LangSwitcher.tsx), a
  separate chrome control) sets a `lang` cookie and navigates to a re-localized URL instead, entirely
  independently. Confirmed by `grep -rn "\.locale\b"` across the frontend source: the *only* other
  reference to `user.locale` in the whole app is this same page reading it back to pre-populate the
  dropdown. Saving a new Language here does nothing a user would notice. **Mobile's equivalent screen
  does not have this bug** — see [mobile/v1/settings/general/screen.md](../../../../mobile/v1/settings/general/screen.md) —
  its Save handler calls the same Riverpod `localeProvider` the app's root widget watches directly, so
  the change applies immediately. Timezone has a related but platform-symmetric gap: it's captured and
  editable on both platforms but neither ever reads it back for actual date/time formatting (both
  derive the "real" timezone from the OS/browser `Intl` API instead — see
  [`lib/date-time.ts`](../../../../../next-js-boilerplate/src/lib/date-time.ts)'s `getTimezone()`).
