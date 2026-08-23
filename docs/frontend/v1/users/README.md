# Users

**Routes:** `/v1/[lang]/users/list` + `/v1/[lang]/users/detail/[uuid]` · **Mobile equivalent:**
[users](../../../mobile/v1/users/README.md)

## Read this before writing anything else here — this is not a real feature

Both pages under this route are **hardcoded static demo content with zero backend calls**. No
`profile/`, no `friends/`, no `messaging/` — no network request of any kind. See
[CROSS-016](../../../issues.md#cross-016) for the full writeup; the short version:

- [`views/users/list/FreePageView.tsx`](../../../../next-js-boilerplate/src/views/users/list/FreePageView.tsx)
  renders a literal `const USERS = [...]` array of 3 fake people (`alice@example.com`,
  `bob@example.com`, `charlie@example.com`), each linking to `/users/detail/{their hardcoded uuid}`.
- [`views/users/detail/[uuid]/FreePageView.tsx`](../../../../next-js-boilerplate/src/views/users/detail/[uuid]/FreePageView.tsx)
  looks up that same hardcoded uuid in a literal `Record<string, {...}>` and renders name/email/role,
  or a "not found" state for any other uuid.
- Every element carries a `data-testid` (`users-list`, `user-uuid`, `user-name`) — this reads as a
  deliberate E2E-test fixture page (something for Playwright/Cypress specs to assert against with
  predictable data), not an unfinished real feature. It's still a real, reachable, authenticated route
  in the shipped app either way — the [v1 layout](../../../architecture.md) requires a logged-in
  session to reach it, same as every other `/v1/[lang]/**` page, but does **not** require any
  particular role or tier.

This matters for the doc structure below: there's no `api.md` content in the usual sense (see
[api.md](./api.md), which documents the *absence* explicitly rather than being omitted), and no
`hooks.md` at all — neither page uses a single React hook (both are plain, non-`"use client"` async
functions).

**Mobile's same-named screens are a completely different, fully real feature** — see
[mobile/v1/users/README.md](../../../mobile/v1/users/README.md) and
[CROSS-016](../../../issues.md#cross-016): live friends list + live user search, backed by real GraphQL
calls, and gated to `ADMIN`/`SUPERADMIN` role only (redirects everyone else to `/feed`) — a role gate
this web version has none of. Two platforms, one route name, two unrelated implementations with
inverted access control. Don't assume parity here just because the folder names match.

## Pages

| Route | Doc |
|---|---|
| `/v1/[lang]/users/list` | [list/page.md](./list/page.md) |
| `/v1/[lang]/users/detail/[uuid]` | [detail/page.md](./detail/page.md) |

## API

[api.md](./api.md) — states the zero-backend-calls finding as the file's entire content, so it's the
first thing a reader checking "what does this page call" sees, rather than something buried in prose.

## Known issues affecting this vertical

- [CROSS-016](../../../issues.md#cross-016) — web is 100% static demo content with no role/tier gate; mobile
  is a real, live-data feature gated to admins only. See also
  [MOB-003](../../../issues.md#mob-003) (mobile's detail screen bug, a consequence of it being real code
  with a real defect — something that can't happen on the web side since there's no code path to have
  the bug in).
