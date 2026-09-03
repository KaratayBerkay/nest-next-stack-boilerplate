# `/v1/:lang` screens

Mirrors [frontend `v1/[lang]`](../../frontend/v1/README.md) — same vertical slugs, so the two doc
trees are diffable by swapping `frontend` ↔ `mobile` in a path. All authenticated routes are
registered as `GoRoute`s under this path prefix in
[`lib/app/router.dart`](../../../flutter-boilerplate/lib/app/router.dart).

| Route | Docs | Status |
|---|---|---|
| `v1/:lang` (root) | [screen.md](./screen.md) | ✅ Phase 5 |
| `v1/:lang/messages` | [messages/screen.md](./messages/screen.md) | ✅ |
| `v1/:lang/chat-room` | [chat-room/screen.md](./chat-room/screen.md) | ✅ Phase 3b |
| `v1/:lang/friends` | [friends/screen.md](./friends/screen.md) | ✅ Phase 2a |
| `v1/:lang/find-friends`(`/requests`) | [find-friends/README.md](./find-friends/README.md) | ✅ Phase 2a |
| `v1/:lang/feed` | [feed/screen.md](./feed/screen.md) | ✅ Phase 2b |
| `v1/:lang/posts` (list/create/detail — no direct web equivalent for list/create, see each screen's doc) | [posts/README.md](./posts/README.md) | ✅ Phase 2b |
| `v1/:lang/share` | [share/screen.md](./share/screen.md) | ✅ Phase 2b |
| `v1/:lang/notification` | [notification/screen.md](./notification/screen.md) | ✅ Phase 3a |
| `v1/:lang/users` | [users/README.md](./users/README.md) | ✅ Phase 2a |
| `v1/:lang/plans` | [plans/screen.md](./plans/screen.md) | ✅ Phase 4a |
| `v1/:lang/checkout` | [checkout/screen.md](./checkout/screen.md) | ✅ Phase 4a |
| `v1/:lang/premium` | [premium/screen.md](./premium/screen.md) — not part of the billing funnel, see `CROSS-035` (resolved — fixed 2026-09-03: `premiumStats`/`growthStats` are `@Roles(ADMIN, SUPERADMIN)`-gated on top of the tier gate, and the Premium nav entry/page is admin-only on web and mobile) | ✅ Phase 4b |
| `v1/:lang/admin`(`/audit-logs`) | [admin/README.md](./admin/README.md) | ✅ Phase 5 |
| `v1/:lang/rtc/*` (hub, calls, meetings(+room), live(+viewer, go-live)) | [rtc/README.md](./rtc/README.md) | ✅ post-docs addition (RTC phases) |
| `v1/:lang/settings/*` (8 sub-screens, incl. `security` — genuinely nested, see `CROSS-014` (resolved)) | [settings/README.md](./settings/README.md) | security/sessions/api-keys ✅ Phase 1b — account/general/privacy ✅ Phase 2a — billing ✅ Phase 4b — usage ✅ (gap closed post-Phase 5, see settings/README.md) |
