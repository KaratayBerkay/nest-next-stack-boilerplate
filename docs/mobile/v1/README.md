# `/v1/:lang` screens

Mirrors [frontend `v1/[lang]`](../../frontend/v1/README.md) — same vertical slugs, so the two doc
trees are diffable by swapping `frontend` ↔ `mobile` in a path. All authenticated routes are
registered as `GoRoute`s under this path prefix in
[`lib/app/router.dart`](../../../flutter-boilerplate/lib/app/router.dart).

| Route | Docs | Status |
|---|---|---|
| `v1/:lang/messages` | [messages/screen.md](./messages/screen.md) | ✅ |
| `v1/:lang/chat-room` | chat-room/screen.md | ⬜ Phase 3 |
| `v1/:lang/friends`, `find-friends` | — | ⬜ Phase 2 |
| `v1/:lang/feed`, `posts`, `share` | — | ⬜ Phase 2 |
| `v1/:lang/notification` | — | ⬜ Phase 3 |
| `v1/:lang/users` | — | ⬜ Phase 2 |
| `v1/:lang/plans`, `checkout`, `premium` | — | ⬜ Phase 4 |
| `v1/:lang/admin` | — | ⬜ Phase 5 |
| `v1/:lang/settings/*` | — | ⬜ split Phases 1/2/4 |
| `v1/:lang/security` (top-level, not nested under settings — unlike web) | — | ⬜ Phase 1 |
