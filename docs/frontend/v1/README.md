# `/v1/[lang]` — the authenticated app shell

Every real in-app page (as opposed to the public `/auth/*` and `(marketing)/*` routes) lives under
`src/app/v1/[lang]/**` — session-gated and localized. **`v1` is a frontend-only URL convention** — it
does not correspond to any backend API version; see
[../../architecture.md § No backend API versioning](../../architecture.md#no-backend-api-versioning)
and [../../issues.md#cross-003](../../issues.md#cross-003).

Shared chrome (header/sidebar/nav/dropdowns wrapping every page below) lives in
`src/views/v1/[lang]/` and is documented once in [../app-shell.md](../app-shell.md), not repeated per
page.

## Pages

| Route | Docs | Status |
|---|---|---|
| `v1/[lang]` (root) | [page.md](./page.md) | ✅ Phase 5 |
| `v1/[lang]/messages` | [messages/page.md](./messages/page.md) | ✅ |
| `v1/[lang]/chat-room` | [chat-room/page.md](./chat-room/page.md) | ✅ Phase 3b |
| `v1/[lang]/friends` | [friends/page.md](./friends/page.md) | ✅ Phase 2a |
| `v1/[lang]/find-friends`(`/requests`) | [find-friends/README.md](./find-friends/README.md) | ✅ Phase 2a |
| `v1/[lang]/feed` | [feed/page.md](./feed/page.md) | ✅ Phase 2b |
| `v1/[lang]/posts/[uuid]` | [posts/page.md](./posts/page.md) | ✅ Phase 2b |
| `v1/[lang]/share` | [share/page.md](./share/page.md) | ✅ Phase 2b |
| `v1/[lang]/notification` | [notification/page.md](./notification/page.md) | ✅ Phase 3a |
| `v1/[lang]/users/{list,detail/[uuid]}` | [users/README.md](./users/README.md) | ✅ Phase 2a |
| `v1/[lang]/plans` | [plans/page.md](./plans/page.md) | ✅ Phase 4a |
| `v1/[lang]/checkout/[tier]` | [checkout/page.md](./checkout/page.md) | ✅ Phase 4a |
| `v1/[lang]/premium` | [premium/page.md](./premium/page.md) — not part of the billing funnel, see [CROSS-035](../../issues.md#cross-035) | ✅ Phase 4b |
| `v1/[lang]/admin`(`/audit-logs`) | [admin/README.md](./admin/README.md) | ✅ Phase 5 |
| `v1/[lang]/rtc/*` (hub, calls, meetings(+room), live(+viewer, go-live)) | [rtc/README.md](./rtc/README.md) | ✅ post-docs addition (RTC phases) |
| `v1/[lang]/settings/*` (8 subpages) | [settings/README.md](./settings/README.md) | security/sessions/api-keys ✅ Phase 1b — account/general/privacy ✅ Phase 2a — billing ✅ Phase 4b — usage ✅ (gap closed post-Phase 5, see settings/README.md) |
