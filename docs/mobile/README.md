# Mobile (`flutter-boilerplate`)

Flutter app, GoRouter-based, conventionally a 1:1 port of the Next.js frontend's real pages. Screens
live in `lib/views/`, routes registered in one file,
[`lib/app/router.dart`](../../flutter-boilerplate/lib/app/router.dart).

## Scope of this documentation

All 19 real web verticals (per [../frontend/README.md](../frontend/README.md)) have a matched
Flutter counterpart — no missing verticals confirmed so far. The same showcase/demo galleries web
excludes (`ui`, `forms`, `demos`, `gallery`, `dashboard`, `routing`, `boom`) exist here too and get
the same treatment: one index in [_reference/showcase-index.md](./_reference/showcase-index.md)
(Phase 5), not per-screen docs.

**Call-shape warning:** unlike a typical mobile app that only talks to one backend, this app's
network calls are **not uniformly routed** — some hit the NestJS backend directly (REST or GraphQL),
some may go through the Next.js BFF (unconfirmed which verticals, if any, actually do this — see
[../issues.md#cross-007](../issues.md#cross-007)). Every `api.md` states the confirmed shape **per
file**, with evidence — never assume from a previous vertical's answer. See
[../conventions.md § 9](../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement).

## Vertical index

| Vertical | Screen | Status |
|---|---|---|
| [Messaging](./v1/messages/) | `v1/:lang/messages` | ✅ — chat-room ⬜ Phase 3 |
| Auth | `/auth/*` (6 screens) | ⬜ Phase 1 |
| Social | friends, find_friends | ⬜ Phase 2 |
| Posts/Feed | feed, posts, share | ⬜ Phase 2 |
| Notifications | notification | ⬜ Phase 3 |
| Users | users (list/detail) | ⬜ Phase 2 |
| Billing | plans, checkout, premium, settings/billing | ⬜ Phase 4 |
| Admin | admin | ⬜ Phase 5 |
| Settings | settings/* (7 sub-screens) + security (top-level, not nested — unlike web) | ⬜ split Phases 1/2/4 |

## Reference

- [app-shell.md](./app-shell.md) — `lib/views/v1/` shell chrome (Phase 5)
- [flutter-only-infra.md](./flutter-only-infra.md) — `share_sheet/`, `fallbacks/app/`,
  `features/statics/` — infra, not verticals (Phase 5)
- [billing-funnel.md](./billing-funnel.md) — mirrors the frontend billing funnel (Phase 4)
- [_reference/showcase-index.md](./_reference/showcase-index.md) — excluded demo galleries (Phase 5)
