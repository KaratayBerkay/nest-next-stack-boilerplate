# Mobile (`flutter-boilerplate`)

Flutter app, GoRouter-based, conventionally a 1:1 port of the Next.js frontend's real pages. Screens
live in `lib/views/`, routes registered in one file,
[`lib/app/router.dart`](../../flutter-boilerplate/lib/app/router.dart).

## Scope of this documentation

All 19 real web verticals (per [../frontend/README.md](../frontend/README.md)) have a matched
Flutter counterpart — no missing verticals confirmed so far. The same showcase/demo galleries web
excludes (`ui`, `forms`, `demos`, `gallery`, `dashboard`, `routing`, `boom`) exist here too and get
the same treatment: one index in [_reference/showcase-index.md](./_reference/showcase-index.md), not
per-screen docs.

**Call-shape warning:** unlike a typical mobile app that only talks to one backend, this app's
network calls are **not uniformly routed** — some hit the NestJS backend directly (REST or GraphQL),
some may go through the Next.js BFF (unconfirmed which verticals, if any, actually do this — see
`CROSS-007` (resolved)). Every `api.md` states the confirmed shape **per
file**, with evidence — never assume from a previous vertical's answer. See
[../conventions.md § 9](../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement).

## Vertical index

| Vertical | Screen | Status |
|---|---|---|
| [Messaging](./v1/messages/) | `v1/:lang/messages`, [`chat-room`](./v1/chat-room/screen.md) | ✅ Phase 3b |
| [Auth](./auth/) | `/auth/*` (6 screens) | ✅ Phase 1a |
| [Home](./v1/screen.md) | `v1/:lang` root landing | ✅ Phase 5 |
| Social | friends, find_friends | ✅ Phase 2a |
| Posts/Feed | feed, posts, share | ✅ Phase 2b |
| [Notifications](./v1/notification/screen.md) | notification | ✅ Phase 3a |
| [Users](./v1/users/) | users (list/detail) | ✅ Phase 2a |
| [Pricing](./pricing/screen.md) | `/pricing` (top-level, redirects to `v1/plans`) | ✅ Phase 4a |
| [About](./about/screen.md) | `/about` (top-level) — no web equivalent nav link either, see [CROSS-038](../issues.md#cross-038) | ✅ Phase 5 |
| [Billing](./billing-funnel.md) | `v1/plans`, `v1/checkout`, `v1/settings/billing` — **not** `v1/premium`, see [billing-funnel.md](./billing-funnel.md#correction-to-this-efforts-own-original-plan) | ✅ Phase 4 |
| [Premium](./v1/premium/screen.md) | `v1/premium` — not part of the billing funnel, see [CROSS-035](../issues.md#cross-035) | ✅ Phase 4b |
| [Admin](./v1/admin/README.md) | admin | ✅ Phase 5 |
| [RTC](./v1/rtc/README.md) | `v1/:lang/rtc` (hub), `rtc/calls`, `rtc/meetings(/:slug)`, `rtc/live(/:slug, /go-live)` + the global call overlay at app root | ✅ post-docs addition (RTC phases) |
| [Settings](./v1/settings/) | `v1/:lang/settings/*` (8 sub-screens, `security` included — **correction:** genuinely routed at `settings/security`, not a top-level route as earlier research claimed; only the Dart *source file* lives outside `lib/views/settings/`, see `CROSS-014` (resolved)) | security/sessions/api-keys ✅ Phase 1b — account/general/privacy ✅ Phase 2a — billing/usage ✅ Phase 4b (usage written post-Phase-5, see [usage/screen.md](./v1/settings/usage/screen.md)) |

## Reference

- [app-shell.md](./app-shell.md) — `lib/views/v1/` shell chrome
- [flutter-only-infra.md](./flutter-only-infra.md) — `share_sheet/`, `fallbacks/app/`,
  `features/statics/` — infra, not verticals
- [billing-funnel.md](./billing-funnel.md) — mirrors the frontend billing funnel (Phase 4)
- [_reference/showcase-index.md](./_reference/showcase-index.md) — excluded demo galleries
