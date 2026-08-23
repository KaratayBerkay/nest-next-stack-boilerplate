# Settings

**Routes:** `/v1/[lang]/settings` (index) + 8 subpages · **Layout:**
[`layout.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/settings/layout.tsx) wraps every
subpage in [`SettingsNav`](../../../../next-js-boilerplate/src/components/settings/SettingsNav.tsx), a
shared tab bar (icon rail on wide viewports, horizontal scroller on narrow ones).
**Mobile equivalent:** [settings](../../../mobile/v1/settings/README.md)

## Subpages

`SettingsNav.tsx`'s `TABS` array is the authoritative list of 8:

| Tab | Route | Status |
|---|---|---|
| [General](./general/page.md) | `settings/general` | ✅ Phase 2a |
| [Account](./account/page.md) | `settings/account` | ✅ Phase 2a |
| [Privacy](./privacy/page.md) | `settings/privacy` | ✅ Phase 2a |
| [Security](./security/page.md) | `settings/security` | ✅ Phase 1b |
| [Usage](./usage/page.md) | `settings/usage` | ✅ (gap closed post-Phase 5 — fell outside both Phase 4 sub-efforts' scope and Phase 5's; written directly once found, see that doc's own note) |
| [Billing](./billing/page.md) | `settings/billing` | ✅ Phase 4b |
| [API Keys](./api-keys/page.md) | `settings/api-keys` | ✅ Phase 1b |
| [Sessions](./sessions/page.md) | `settings/sessions` | ✅ Phase 1b |

## The settings index page (`/v1/[lang]/settings`, no tab of its own)

[`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/settings/page.tsx) →
[`views/settings/PageContent.tsx`](../../../../next-js-boilerplate/src/views/settings/PageContent.tsx)
is the settings vertical's own landing page — not one of the 8 `SettingsNav` tabs, reached by
navigating to `/settings` directly (e.g. a "Settings" link elsewhere in the app shell). It renders a
plan summary (`PlanInfoCard`, `PlanAdvantages`, `UpgradeActions`) sourced from
`subscriptionQueryOptions` — subscription/billing domain, not account-security — so it's grouped with
Billing above rather than documented here. Mentioned for completeness since it lives at the same
`app/v1/[lang]/settings/` filesystem level as the three subpages this doc covers.

## Which backend module each subpage calls

| Subpage | Backend module(s) |
|---|---|
| [Security](./security/page.md) | [mfa](../../../backend/identity-access/mfa/README.md) (2FA enroll/verify/disable) + a change-password action that calls into [auth](../../../backend/identity-access/auth/README.md) |
| [Sessions](./sessions/page.md) | [sessions](../../../backend/identity-access/sessions/README.md) |
| [API Keys](./api-keys/page.md) | [api-keys](../../../backend/identity-access/api-keys/README.md) |
| [General](./general/page.md), [Account](./account/page.md), [Privacy](./privacy/page.md) | [profile](../../../backend/social-content/profile/README.md) (all three read/write different field groups on the same user record) |
| [Billing](./billing/page.md) | [billing](../../../backend/billing-usage/billing/README.md) |
| [Usage](./usage/page.md) | [usage](../../../backend/billing-usage/usage/README.md) |

Two Identity & Access backend modules have **no dedicated settings subpage at all**:
[authorization](../../../backend/identity-access/authorization/README.md) (real consumer is the
`/admin` page, Phase 5) and [csrf](../../../backend/identity-access/csrf/README.md) (pure
infrastructure, referenced from other modules' mutation routes, not a page). One more,
[devices](../../../backend/identity-access/devices/README.md), has no page either — it's an app-wide
auth-bootstrap dependency, not settings-specific.

## Known issues affecting this vertical

- [CROSS-012](../../../issues.md#cross-012) — `updateApiKey` (rename/enable-disable a key) is fully
  built backend + BFF, with zero UI on either platform. See
  [api-keys/page.md](./api-keys/page.md#known-issues).
- A dead-code pattern shows up twice in this vertical alone, once per platform: web's
  [`mfa-handlers.ts`](./security/api.md#known-issues) and mobile's `api_key_list.dart`/
  `create_api_key_form.dart`/`api_key_handlers.dart` (see
  [mobile api-keys/screen.md](../../../mobile/v1/settings/api-keys/screen.md#known-issues)) are both
  fully-formed, unused parallel implementations sitting next to the real one. Logged together as
  [CROSS-013](../../../issues.md#cross-013) since it's the same failure shape on both platforms in the
  same vertical, not two unrelated one-offs.
- [CROSS-019](../../../issues.md#cross-019) — General's Language field only actually changes the
  rendered UI language on mobile; web only reads `profile.locale` back to pre-fill its own dropdown.
  Timezone persists on both platforms but neither reads it back for real date/time formatting. See
  [general/page.md](./general/page.md#known-issues).
- ⚠ [CROSS-034](../../../issues.md#cross-034) — Billing's `PaymentMethods` is read-only on web
  (no add/remove/set-default anywhere) despite full backend support and even already-built, unused
  client hooks — [mobile's equivalent](../../../mobile/v1/settings/billing/screen.md) has a working
  version of all three. See [billing/page.md](./billing/page.md#known-issues-affecting-this-page).
- ⚠ [MOB-020](../../../issues.md#mob-020) — the dead-parallel-implementation pattern noted
  above (mfa-handlers.ts / api-keys' 3 files / account+general's 2 files) recurs a fifth time in
  Billing, mobile-side: `payment_methods.dart`'s `PaymentMethods` widget class is fully built and never
  imported — the real screen reimplements the same list/remove/set-default UI inline instead.
