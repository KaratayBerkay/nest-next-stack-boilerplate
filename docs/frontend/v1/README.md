# `/v1/[lang]` — the authenticated app shell

Every real in-app page (as opposed to the public `/auth/*` and `(marketing)/*` routes) lives under
`src/app/v1/[lang]/**` — session-gated and localized. **`v1` is a frontend-only URL convention** — it
does not correspond to any backend API version; see
[../../architecture.md § No backend API versioning](../../architecture.md#no-backend-api-versioning)
and [../../issues.md#cross-003](../../issues.md#cross-003).

Shared chrome (header/sidebar/nav/dropdowns wrapping every page below) lives in
`src/views/v1/[lang]/` and is documented once in [../app-shell.md](../app-shell.md) (Phase 5), not
repeated per page.

## Pages

| Route | Docs | Status |
|---|---|---|
| `v1/[lang]` (root) | [page.md](./page.md) | ⬜ Phase 5 |
| `v1/[lang]/messages` | [messages/page.md](./messages/page.md) | ✅ |
| `v1/[lang]/chat-room` | chat-room/page.md | ⬜ Phase 3 |
| `v1/[lang]/friends` | friends/page.md | ⬜ Phase 2 |
| `v1/[lang]/find-friends`(`/requests`) | find-friends/page.md | ⬜ Phase 2 |
| `v1/[lang]/feed` | feed/page.md | ⬜ Phase 2 |
| `v1/[lang]/posts/[uuid]` | posts/page.md | ⬜ Phase 2 |
| `v1/[lang]/share` | share/page.md | ⬜ Phase 2 |
| `v1/[lang]/notification` | notification/page.md | ⬜ Phase 3 |
| `v1/[lang]/users/{list,detail/[uuid]}` | users/README.md | ⬜ Phase 2 |
| `v1/[lang]/plans` | plans/page.md | ⬜ Phase 4 |
| `v1/[lang]/checkout/[tier]` | checkout/page.md | ⬜ Phase 4 |
| `v1/[lang]/premium` | premium/page.md | ⬜ Phase 4 |
| `v1/[lang]/admin`(`/audit-logs`) | admin/README.md | ⬜ Phase 5 |
| `v1/[lang]/settings/*` (8 subpages) | settings/README.md | ⬜ split Phases 1/2/4 |
